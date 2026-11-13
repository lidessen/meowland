import { describeNodes, parseTemplate } from "./i18n-message";

/**
 * Build-time audit for `meowjsx/i18n`. Pure functions over strings: no IO, no DOM, no
 * runtime or renderer. `extractMessages` is a scanner, not a TypeScript parser: it lexes
 * enough of TS/TSX to skip comments, strings, templates, regex literals and JSX text, finds
 * the call sites of the message functions and reads only their argument lists. What it
 * cannot read is returned in `dynamic`, never skipped.
 */

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type ExtractedKind = "t" | "rich" | "defined";

export interface ExtractedMessage {
  readonly source: string;
  readonly context?: string;
  readonly note?: string;
  readonly kind: ExtractedKind;
  /** The table key of a `defineMessages` member. */
  readonly key?: string;
  /** Set for a `.lookup("...")` call: the text is literal, not an ICU template. */
  readonly literal?: true;
  readonly file: string;
  /** 1-based position of the callee name, or of the member for `defineMessages`. */
  readonly line: number;
  readonly column: number;
  /** Argument names the template uses. Empty when the source does not parse or is literal. */
  readonly placeholders: string[];
  /** Rich tag names; non-empty only for kind "rich". */
  readonly tags: string[];
}

/**
 * Why a call could not be read: `missing-argument`, `template-literal` (substitutions),
 * `concatenation`, `identifier`, `member-access`, `call`, `expression`, `lookup` (a
 * non-literal `.lookup(...)` argument, always reported), `context` (a context that is not a
 * literal), `options` (an options argument that is not an object literal),
 * `not-an-object-literal` and `unreadable-member` (`defineMessages`).
 */
export interface DynamicCall {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly callee: string;
  /** A short excerpt of the argument source. */
  readonly argument: string;
  readonly reason: string;
}

/** `import { t as x } from "meowjsx/i18n"`. */
export interface AliasReport {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly imported: string;
  readonly local: string;
  readonly module: string;
}

export interface Extraction {
  messages: ExtractedMessage[];
  dynamic: DynamicCall[];
  aliases: AliasReport[];
}

// ---------------------------------------------------------------------------
// Lexer
// ---------------------------------------------------------------------------

interface Token {
  type: "ident" | "number" | "string" | "template" | "regex" | "jsx" | "punct";
  text: string;
  start: number;
  end: number;
  /** Decoded value of a string or of a template without substitutions. */
  value?: string;
  /** A template literal without substitutions. */
  simple?: boolean;
}

class Abort extends Error {}

/** After these words an expression starts, so `/` is a regex and `<` may open JSX. */
const EXPRESSION_KEYWORDS = new Set([
  "return",
  "typeof",
  "instanceof",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "case",
  "do",
  "else",
  "yield",
  "await",
  "default",
]);

const isIdentifierStart = (char: string): boolean => /[\p{ID_Start}$_]/u.test(char);
const isIdentifierPart = (char: string): boolean => /[\p{ID_Continue}$‌‍]/u.test(char);
const isSpace = (char: string): boolean => /\s/.test(char);
const isDigit = (char: string): boolean => char >= "0" && char <= "9";

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  const length = code.length;
  let pos = 0;

  const push = (token: Token): Token => {
    tokens.push(token);
    return token;
  };
  const punct = (text: string, at: number): void => {
    push({ type: "punct", text, start: at, end: at + text.length });
  };

  /** Consumes one escape sequence starting at the backslash and returns its value. */
  const readEscape = (): string => {
    pos += 1;
    const char = code[pos];
    if (char === undefined) return "";
    pos += 1;
    switch (char) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "v":
        return "\v";
      case "0":
        return isDigit(code[pos] ?? "") ? "0" : "\0";
      case "x": {
        const digits = code.slice(pos, pos + 2);
        if (/^[0-9a-fA-F]{2}$/.test(digits)) {
          pos += 2;
          return String.fromCharCode(Number.parseInt(digits, 16));
        }
        return "x";
      }
      case "u": {
        if (code[pos] === "{") {
          const close = code.indexOf("}", pos);
          const digits = close < 0 ? "" : code.slice(pos + 1, close);
          if (/^[0-9a-fA-F]{1,6}$/.test(digits) && Number.parseInt(digits, 16) <= 0x10ffff) {
            pos = close + 1;
            return String.fromCodePoint(Number.parseInt(digits, 16));
          }
          return "u";
        }
        const digits = code.slice(pos, pos + 4);
        if (/^[0-9a-fA-F]{4}$/.test(digits)) {
          pos += 4;
          return String.fromCharCode(Number.parseInt(digits, 16));
        }
        return "u";
      }
      case "\r":
        if (code[pos] === "\n") pos += 1;
        return "";
      case "\n":
      case " ":
      case " ":
        return "";
      default:
        return char;
    }
  };

  const skipComment = (): boolean => {
    if (code[pos] !== "/") return false;
    if (code[pos + 1] === "/") {
      const end = code.indexOf("\n", pos);
      pos = end < 0 ? length : end;
      return true;
    }
    if (code[pos + 1] === "*") {
      const end = code.indexOf("*/", pos + 2);
      pos = end < 0 ? length : end + 2;
      return true;
    }
    return false;
  };

  const skipTrivia = (): void => {
    while (pos < length) {
      if (isSpace(code[pos]!)) pos += 1;
      else if (!skipComment()) break;
    }
  };

  const expressionEnded = (): boolean => {
    const previous = tokens[tokens.length - 1];
    if (!previous) return false;
    if (previous.type === "ident") return !EXPRESSION_KEYWORDS.has(previous.text);
    if (previous.type === "punct")
      return previous.text === ")" || previous.text === "]" || previous.text === "}";
    return true;
  };

  function scanString(quote: string): void {
    const start = pos;
    pos += 1;
    let value = "";
    while (pos < length) {
      const char = code[pos]!;
      if (char === quote) {
        pos += 1;
        break;
      }
      if (char === "\\") value += readEscape();
      else if (char === "\n") break;
      else {
        value += char;
        pos += 1;
      }
    }
    push({ type: "string", text: code.slice(start, pos), start, end: pos, value });
  }

  /** `{` ... `}` with virtual brace tokens so commas inside never split an argument. */
  function scanContainer(): void {
    punct("{", pos);
    pos += 1;
    scanCode(true);
    if (pos >= length) throw new Abort();
    punct("}", pos);
    pos += 1;
  }

  function scanTemplate(): void {
    const start = pos;
    pos += 1;
    let value = "";
    let simple = true;
    const token = push({ type: "template", text: "", start, end: start });
    while (pos < length) {
      const char = code[pos]!;
      if (char === "`") {
        pos += 1;
        break;
      }
      if (char === "\\") value += readEscape();
      else if (char === "$" && code[pos + 1] === "{") {
        simple = false;
        pos += 1;
        scanContainer();
      } else {
        value += char;
        pos += 1;
      }
    }
    token.end = pos;
    token.text = code.slice(start, pos);
    token.simple = simple;
    if (simple) token.value = value;
  }

  function scanRegex(): boolean {
    const start = pos;
    let cursor = pos + 1;
    let inClass = false;
    while (cursor < length) {
      const char = code[cursor]!;
      if (char === "\n") return false;
      if (char === "\\") cursor += 2;
      else if (char === "[") {
        inClass = true;
        cursor += 1;
      } else if (char === "]") {
        inClass = false;
        cursor += 1;
      } else if (char === "/" && !inClass) break;
      else cursor += 1;
    }
    if (cursor >= length) return false;
    cursor += 1;
    while (cursor < length && /[a-z]/i.test(code[cursor]!)) cursor += 1;
    pos = cursor;
    push({ type: "regex", text: code.slice(start, pos), start, end: pos });
    return true;
  }

  const startsJsx = (): boolean => {
    if (expressionEnded()) return false;
    const next = code[pos + 1];
    if (next === undefined || (next !== ">" && !isIdentifierStart(next))) return false;
    // `<T,>(x) => x` and `<T extends U>(x) => x` are generic arrow functions, not elements.
    return !/^<[\p{ID_Start}$_][\w$.:-]*\s*(,|extends\b)/u.test(code.slice(pos, pos + 80));
  };

  function skipJsxSpace(): void {
    skipTrivia();
  }

  function scanJsxChildren(): void {
    for (;;) {
      while (pos < length && code[pos] !== "<" && code[pos] !== "{") pos += 1;
      if (pos >= length) throw new Abort();
      if (code[pos] === "{") scanContainer();
      else if (code[pos + 1] === "/") {
        const close = code.indexOf(">", pos);
        if (close < 0) throw new Abort();
        pos = close + 1;
        return;
      } else scanJsxElement(false);
    }
  }

  function scanJsxElement(top: boolean): void {
    const start = pos;
    const marker = top ? push({ type: "jsx", text: "<", start, end: start }) : undefined;
    pos += 1;
    if (code[pos] === ">") {
      pos += 1;
      scanJsxChildren();
    } else {
      while (pos < length && /[\w$.:-]/.test(code[pos]!)) pos += 1;
      for (;;) {
        skipJsxSpace();
        const char = code[pos];
        if (char === undefined) throw new Abort();
        if (char === "/" && code[pos + 1] === ">") {
          pos += 2;
          break;
        }
        if (char === ">") {
          pos += 1;
          scanJsxChildren();
          break;
        }
        if (char === "{") scanContainer();
        else if (/[\w$]/.test(char)) {
          while (pos < length && /[\w$:.-]/.test(code[pos]!)) pos += 1;
          skipJsxSpace();
          if (code[pos] !== "=") continue;
          pos += 1;
          skipJsxSpace();
          const value = code[pos];
          if (value === '"' || value === "'") {
            const close = code.indexOf(value, pos + 1);
            if (close < 0) throw new Abort();
            pos = close + 1;
          } else if (value === "{") scanContainer();
          else if (value === "<") scanJsxElement(false);
          else throw new Abort();
        } else throw new Abort();
      }
    }
    if (marker) marker.end = pos;
  }

  function scanCode(untilBrace: boolean): void {
    let depth = 0;
    while (pos < length) {
      const char = code[pos]!;
      if (isSpace(char)) {
        pos += 1;
      } else if (char === "/" && (code[pos + 1] === "/" || code[pos + 1] === "*")) {
        skipComment();
      } else if (char === '"' || char === "'") {
        scanString(char);
      } else if (char === "`") {
        scanTemplate();
      } else if (isIdentifierStart(char)) {
        const start = pos;
        pos += 1;
        while (pos < length && isIdentifierPart(code[pos]!)) pos += 1;
        push({ type: "ident", text: code.slice(start, pos), start, end: pos });
      } else if (isDigit(char)) {
        const start = pos;
        while (pos < length && /[\w.]/.test(code[pos]!)) pos += 1;
        push({ type: "number", text: code.slice(start, pos), start, end: pos });
      } else if (char === "{") {
        depth += 1;
        punct("{", pos);
        pos += 1;
      } else if (char === "}") {
        if (depth === 0 && untilBrace) return;
        depth = Math.max(0, depth - 1);
        punct("}", pos);
        pos += 1;
      } else if (char === "<" && startsJsx()) {
        const snapshot = { pos, count: tokens.length };
        try {
          scanJsxElement(true);
        } catch (error) {
          if (!(error instanceof Abort)) throw error;
          pos = snapshot.pos;
          tokens.length = snapshot.count;
          punct("<", pos);
          pos += 1;
        }
      } else if (char === "/" && !expressionEnded() && scanRegex()) {
        // The regex token is pushed by scanRegex.
      } else {
        punct(char, pos);
        pos += 1;
      }
    }
    if (untilBrace) throw new Abort();
  }

  try {
    scanCode(false);
  } catch (error) {
    if (!(error instanceof Abort)) throw error;
  }
  return tokens;
}

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

const isPunct = (token: Token | undefined, text: string): boolean =>
  token?.type === "punct" && token.text === text;
const isIdent = (token: Token | undefined, text?: string): boolean =>
  token?.type === "ident" && (text === undefined || token.text === text);

/** The value of a single string literal or substitution-free template, or `undefined`. */
function literalValue(tokens: readonly Token[]): string | undefined {
  let list = tokens;
  // `"text" as const` is still a literal.
  if (list.length === 3 && isIdent(list[1], "as") && isIdent(list[2], "const"))
    list = list.slice(0, 1);
  if (list.length !== 1) return undefined;
  const token = list[0]!;
  if (token.type === "string") return token.value;
  if (token.type === "template" && token.simple) return token.value;
  return undefined;
}

/** Splits at top-level commas. */
function splitTop(tokens: readonly Token[]): Token[][] {
  const parts: Token[][] = [[]];
  let depth = 0;
  for (const token of tokens) {
    if (token.type === "punct") {
      if (token.text === "(" || token.text === "[" || token.text === "{") depth += 1;
      else if (token.text === ")" || token.text === "]" || token.text === "}") depth -= 1;
      else if (token.text === "," && depth === 0) {
        parts.push([]);
        continue;
      }
    }
    parts[parts.length - 1]!.push(token);
  }
  if (parts[parts.length - 1]!.length === 0) parts.pop();
  return parts;
}

/** The tokens inside the object literal that starts `tokens`, or `undefined`. */
function objectBody(tokens: readonly Token[]): Token[] | undefined {
  if (!isPunct(tokens[0], "{")) return undefined;
  let depth = 0;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    if (token.type !== "punct") continue;
    if (token.text === "(" || token.text === "[" || token.text === "{") depth += 1;
    else if (token.text === ")" || token.text === "]" || token.text === "}") {
      depth -= 1;
      if (depth === 0) return tokens.slice(1, index);
    }
  }
  return undefined;
}

function memberKey(member: readonly Token[]): string | undefined {
  const key = member[0];
  if (!key || !isPunct(member[1], ":")) return undefined;
  if (key.type === "ident") return key.text;
  if (key.type === "string") return key.value;
  return undefined;
}

interface ReadOptions {
  context?: string;
  note?: string;
  /** Set when the options cannot be read, naming the reason. */
  unreadable?: "context" | "options";
}

/** Reads `context` and `note` from an options object literal argument. */
function readOptions(argument: readonly Token[] | undefined): ReadOptions {
  if (!argument || argument.length === 0) return {};
  if (
    argument.length === 1 &&
    isIdent(argument[0]) &&
    ["undefined", "null"].includes(argument[0]!.text)
  ) {
    return {};
  }
  const body = objectBody(argument);
  if (!body) return { unreadable: "options" };
  const result: ReadOptions = {};
  for (const member of splitTop(body)) {
    if (isPunct(member[0], ".")) return { unreadable: "options" };
    const shorthand = member.length === 1 && isIdent(member[0]) ? member[0]!.text : undefined;
    const key = memberKey(member) ?? shorthand;
    if (key !== "context" && key !== "note") continue;
    const value = shorthand ? undefined : literalValue(member.slice(2));
    if (value === undefined) {
      if (key === "context") return { unreadable: "context" };
    } else if (key === "context") result.context = value;
    else result.note = value;
  }
  return result;
}

function excerpt(code: string, tokens: readonly Token[]): string {
  if (tokens.length === 0) return "";
  // A template ends after its last substitution token, so the end is the furthest token end.
  const end = Math.max(...tokens.map((token) => token.end));
  const text = code.slice(tokens[0]!.start, end).replace(/\s+/g, " ").trim();
  return text.length > 60 ? `${text.slice(0, 57)}...` : text;
}

function dynamicReason(tokens: readonly Token[]): string {
  if (tokens.length === 0) return "missing-argument";
  let depth = 0;
  for (const token of tokens) {
    if (token.type !== "punct") continue;
    if (token.text === "(" || token.text === "[" || token.text === "{") depth += 1;
    else if (token.text === ")" || token.text === "]" || token.text === "}") depth -= 1;
    else if (token.text === "+" && depth === 0) return "concatenation";
  }
  if (tokens[0]!.type === "template") return "template-literal";
  if (tokens.length === 1 && isIdent(tokens[0])) return "identifier";
  if (tokens.every((token) => isIdent(token) || isPunct(token, ".") || isPunct(token, "?"))) {
    return "member-access";
  }
  if (isPunct(tokens[tokens.length - 1], ")")) return "call";
  return "expression";
}

// ---------------------------------------------------------------------------
// extractMessages
// ---------------------------------------------------------------------------

const I18N_MODULE = /(^|\/)i18n(\.[cm]?[jt]sx?)?$/;
const ALIASED = new Set(["t", "defineMessages"]);

/** Parses a source for its argument and tag names; empty when it does not parse. */
function describeSource(source: string, rich: boolean): { names: string[]; tags: string[] } {
  try {
    return describeNodes(parseTemplate(source, { rich }));
  } catch {
    return { names: [], tags: [] };
  }
}

export function extractMessages(code: string, file: string): Extraction {
  const tokens = tokenize(code);
  const lineStarts = [0];
  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === "\n") lineStarts.push(index + 1);
  }
  const position = (offset: number): { line: number; column: number } => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low < high) {
      const middle = (low + high + 1) >> 1;
      if (lineStarts[middle]! <= offset) low = middle;
      else high = middle - 1;
    }
    return { line: low + 1, column: offset - lineStarts[low]! + 1 };
  };

  const messages: ExtractedMessage[] = [];
  const dynamic: DynamicCall[] = [];
  const aliases: AliasReport[] = [];
  const aliasOf = new Map<string, string>();

  const addDynamic = (at: Token, callee: string, argument: string, reason: string): void => {
    dynamic.push({ file, ...position(at.start), callee, argument, reason });
  };
  const addMessage = (
    at: Token,
    kind: ExtractedKind,
    source: string,
    read: ReadOptions,
    extra: { key?: string; literal?: true },
  ): void => {
    const described = extra.literal
      ? { names: [], tags: [] }
      : describeSource(source, kind === "rich");
    messages.push({
      source,
      ...(read.context === undefined ? {} : { context: read.context }),
      ...(read.note === undefined ? {} : { note: read.note }),
      kind,
      ...(extra.key === undefined ? {} : { key: extra.key }),
      ...(extra.literal ? { literal: true as const } : {}),
      file,
      ...position(at.start),
      placeholders: described.names,
      tags: kind === "rich" ? described.tags : [],
    });
  };

  /** The argument token lists of the call whose `(` is at `open`, or `undefined`. */
  const callArguments = (open: number): { args: Token[][]; close: number } | undefined => {
    let depth = 0;
    for (let index = open + 1; index < tokens.length; index += 1) {
      const token = tokens[index]!;
      if (token.type !== "punct") continue;
      if (token.text === "(" || token.text === "[" || token.text === "{") depth += 1;
      else if (token.text === ")" || token.text === "]" || token.text === "}") {
        if (depth === 0) {
          if (token.text !== ")") return undefined;
          return { args: splitTop(tokens.slice(open + 1, index)), close: index };
        }
        depth -= 1;
      }
    }
    return undefined;
  };

  const readAlias = (importIndex: number): void => {
    let cursor = importIndex + 1;
    if (isIdent(tokens[cursor], "type")) return;
    while (cursor < importIndex + 8 && !isPunct(tokens[cursor], "{")) {
      if (tokens[cursor]?.type === "string") return;
      cursor += 1;
    }
    if (!isPunct(tokens[cursor], "{")) return;
    const end = tokens.findIndex((token, index) => index > cursor && isPunct(token, "}"));
    if (end < 0 || !isIdent(tokens[end + 1], "from") || tokens[end + 2]?.type !== "string") return;
    const module = tokens[end + 2]!.value!;
    if (!I18N_MODULE.test(module)) return;
    for (const specifier of splitTop(tokens.slice(cursor + 1, end))) {
      const names = specifier.filter((token) => isIdent(token));
      const asIndex = names.findIndex((token) => token.text === "as");
      if (asIndex <= 0 || asIndex !== names.length - 2) continue;
      const imported = names[asIndex - 1]!;
      const local = names[asIndex + 1]!;
      if (!ALIASED.has(imported.text) || local.text === imported.text) continue;
      aliasOf.set(local.text, imported.text);
      aliases.push({
        file,
        ...position(imported.start),
        imported: imported.text,
        local: local.text,
        module,
      });
    }
  };

  const readMessageCall = (
    at: Token,
    callee: string,
    kind: "t" | "rich" | "lookup",
    args: readonly Token[][],
  ): void => {
    const first = args[0] ?? [];
    const optionsIndex = kind === "rich" ? 3 : kind === "lookup" ? 1 : 2;
    const source = literalValue(first);
    if (source === undefined) {
      addDynamic(
        at,
        callee,
        excerpt(code, first),
        kind === "lookup" ? "lookup" : dynamicReason(first),
      );
      return;
    }
    const read = readOptions(args[optionsIndex]);
    if (read.unreadable) {
      addDynamic(at, callee, excerpt(code, args[optionsIndex] ?? first), read.unreadable);
      return;
    }
    if (kind === "lookup") addMessage(at, "t", source, read, { literal: true });
    else addMessage(at, kind, source, read, {});
  };

  const readDefineMessages = (at: Token, callee: string, args: readonly Token[][]): void => {
    const first = args[0] ?? [];
    const body = objectBody(first);
    if (!body) {
      addDynamic(
        at,
        callee,
        excerpt(code, first),
        first.length === 0 ? "missing-argument" : "not-an-object-literal",
      );
      return;
    }
    for (const member of splitTop(body)) {
      const keyToken = member[0]!;
      const key = memberKey(member);
      const value = member.slice(2);
      if (key === undefined) {
        addDynamic(keyToken, callee, excerpt(code, member), "unreadable-member");
        continue;
      }
      const direct = literalValue(value);
      if (direct !== undefined) {
        addMessage(keyToken, "defined", direct, {}, { key });
        continue;
      }
      const inner = objectBody(value);
      const fields = inner ? splitTop(inner) : [];
      const sourceField = fields.find((field) => memberKey(field) === "source");
      const source = sourceField ? literalValue(sourceField.slice(2)) : undefined;
      if (!inner || source === undefined) {
        addDynamic(keyToken, callee, excerpt(code, member), "unreadable-member");
        continue;
      }
      const read = readOptions(value);
      if (read.unreadable) {
        addDynamic(keyToken, callee, excerpt(code, member), read.unreadable);
        continue;
      }
      addMessage(keyToken, "defined", source, read, { key });
    }
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    if (token.type !== "ident") {
      continue;
    }
    if (token.text === "import") {
      readAlias(index);
      continue;
    }
    const previous = tokens[index - 1];
    if (isIdent(previous, "function")) continue;
    const spread =
      isPunct(previous, ".") &&
      isPunct(tokens[index - 2], ".") &&
      tokens[index - 2]!.end === previous!.start;
    const member = isPunct(previous, ".") && !spread;
    const prefix = member ? "." : "";
    const imported = member ? undefined : aliasOf.get(token.text);
    const name = imported ?? token.text;
    const next = tokens[index + 1];

    let run: ((args: Token[][]) => void) | undefined;
    let open = -1;
    if (name === "t") {
      if (isPunct(next, "(")) {
        open = index + 1;
        const callee = prefix + token.text;
        run = (args) => readMessageCall(token, callee, "t", args);
      } else if (
        isPunct(next, ".") &&
        isIdent(tokens[index + 2], "rich") &&
        isPunct(tokens[index + 3], "(")
      ) {
        open = index + 3;
        const callee = `${prefix}${token.text}.rich`;
        run = (args) => readMessageCall(token, callee, "rich", args);
      }
    } else if (name === "lookup" && member && isPunct(next, "(")) {
      open = index + 1;
      run = (args) => readMessageCall(token, ".lookup", "lookup", args);
    } else if (name === "defineMessages" && isPunct(next, "(")) {
      open = index + 1;
      const callee = prefix + token.text;
      run = (args) => readDefineMessages(token, callee, args);
    }
    if (!run) continue;
    const call = callArguments(open);
    if (!call) continue;
    // `t(source) { ... }` is a method or function definition, not a call.
    if (isPunct(tokens[call.close + 1], "{")) continue;
    run(call.args);
  }

  return { messages, dynamic, aliases };
}

// ---------------------------------------------------------------------------
// messageArguments
// ---------------------------------------------------------------------------

/**
 * Argument names and rich tag names of a message, from the parser the run time uses.
 * `rich: true` reads `<name>...</name>` tags. Throws an `Error` when the template does not
 * parse.
 */
export function messageArguments(
  source: string,
  options: { readonly rich?: boolean } = {},
): { names: string[]; tags: string[] } {
  try {
    return describeNodes(parseTemplate(source, { rich: options.rich === true }));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

// ---------------------------------------------------------------------------
// auditCatalog
// ---------------------------------------------------------------------------

/** Flat map from source to a translation, or to a map from context (`""` = none). */
export type AuditCatalog = {
  readonly [source: string]: string | { readonly [context: string]: string };
};

/** A message to audit; every `ExtractedMessage` satisfies this. */
export interface AuditMessage {
  readonly source: string;
  readonly context?: string;
  readonly note?: string;
  readonly kind?: ExtractedKind;
  /** The text is literal, not an ICU template: its braces and apostrophes are not parsed. */
  readonly literal?: boolean;
  readonly file?: string;
  readonly line?: number;
}

export interface MissingItem {
  source: string;
  context?: string;
  note?: string;
  file?: string;
  line?: number;
}
export interface UnusedItem {
  source: string;
  context?: string;
  translation: string;
  closest?: { source: string; context?: string };
}
export interface InvalidItem {
  source: string;
  context?: string;
  translation: string;
  reason: string;
}
export interface AuditResult {
  /** The locale audited; recorded, not used to validate plural categories. */
  locale: string;
  missing: MissingItem[];
  unused: UnusedItem[];
  invalid: InvalidItem[];
}

export interface AuditOptions {
  /** Messages the scanner cannot see, such as the copy passed to `i18n.lookup`. */
  readonly extra?: readonly AuditMessage[];
  /** Whether `extra` entries are literal text (default `true`, as `lookup` treats them). */
  readonly extraLiteral?: boolean;
}

/** `closest` needs at least this normalized edit-distance similarity (1 is identical). */
export const CLOSEST_SIMILARITY = 0.6;

function similarity(a: string, b: string): number {
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  const longest = Math.max(left.length, right.length);
  if (longest === 0) return 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= right.length; column += 1) {
      current[column] = Math.min(
        previous[column]! + 1,
        current[column - 1]! + 1,
        previous[column - 1]! + (left[row - 1] === right[column - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return 1 - previous[right.length]! / longest;
}

const identity = (source: string, context: string | undefined): string =>
  JSON.stringify([context ?? "", source]);

function translationOf(
  catalog: AuditCatalog,
  source: string,
  context: string | undefined,
): string | undefined {
  if (!Object.hasOwn(catalog, source)) return undefined;
  const entry = catalog[source];
  let found: unknown;
  if (typeof entry === "string")
    found = context === undefined || context === "" ? entry : undefined;
  else if (typeof entry === "object" && entry !== null) {
    found = Object.hasOwn(entry, context ?? "") ? entry[context ?? ""] : undefined;
  }
  return typeof found === "string" && found !== "" ? found : undefined;
}

function difference(label: string, expected: readonly string[], actual: readonly string[]): string {
  const missing = expected.filter((name) => !actual.includes(name));
  const unexpected = actual.filter((name) => !expected.includes(name));
  return (
    `${label} differ from the source` +
    (missing.length ? `; missing: ${missing.join(", ")}` : "") +
    (unexpected.length ? `; unexpected: ${unexpected.join(", ")}` : "")
  );
}

/**
 * Compares the messages the code uses with one locale's catalog and returns the work list.
 * `catalog` maps a source to a translation, or to a map from context to translation.
 */
export function auditCatalog(
  messages: readonly AuditMessage[],
  catalog: AuditCatalog,
  locale: string,
  options: AuditOptions = {},
): AuditResult {
  const extraLiteral = options.extraLiteral ?? true;
  const wanted = new Map<string, AuditMessage & { literal: boolean; rich: boolean }>();
  const add = (message: AuditMessage, literal: boolean): void => {
    const key = identity(message.source, message.context);
    const known = wanted.get(key);
    const rich = message.kind === "rich";
    if (known) {
      if (rich) known.rich = true;
      return;
    }
    wanted.set(key, { ...message, literal: literal || message.literal === true, rich });
  };
  for (const message of messages) add(message, false);
  for (const message of options.extra ?? []) add(message, extraLiteral);

  const result: AuditResult = { locale, missing: [], unused: [], invalid: [] };

  for (const message of wanted.values()) {
    const { source, context } = message;
    const translation = translationOf(catalog, source, context);
    if (translation === undefined) {
      result.missing.push({
        source,
        ...(context === undefined || context === "" ? {} : { context }),
        ...(message.note === undefined ? {} : { note: message.note }),
        ...(message.file === undefined ? {} : { file: message.file }),
        ...(message.line === undefined ? {} : { line: message.line }),
      });
      continue;
    }
    if (message.literal) continue;
    const invalid = (reason: string): void => {
      result.invalid.push({
        source,
        ...(context === undefined || context === "" ? {} : { context }),
        translation,
        reason,
      });
    };
    let expected: { names: string[]; tags: string[] };
    try {
      expected = messageArguments(source, { rich: message.rich });
    } catch (error) {
      invalid(`the source does not parse: ${(error as Error).message}`);
      continue;
    }
    let actual: { names: string[]; tags: string[] };
    try {
      actual = messageArguments(translation, { rich: message.rich });
    } catch (error) {
      invalid(`the translation does not parse: ${(error as Error).message}`);
      continue;
    }
    if (expected.names.join("\u0000") !== actual.names.join("\u0000")) {
      invalid(difference("argument names", expected.names, actual.names));
    } else if (message.rich && expected.tags.join("\u0000") !== actual.tags.join("\u0000")) {
      invalid(difference("rich tags", expected.tags, actual.tags));
    }
  }

  const entries: { source: string; context: string; translation: string }[] = [];
  for (const source of Object.keys(catalog)) {
    const entry = catalog[source];
    if (typeof entry === "string") entries.push({ source, context: "", translation: entry });
    else if (typeof entry === "object" && entry !== null) {
      for (const context of Object.keys(entry)) {
        entries.push({ source, context, translation: entry[context]! });
      }
    }
  }
  for (const entry of entries) {
    if (typeof entry.translation !== "string" || entry.translation === "") continue;
    if (wanted.has(identity(entry.source, entry.context))) continue;
    let closest: MissingItem | undefined;
    let best = CLOSEST_SIMILARITY;
    for (const candidate of result.missing) {
      const score = similarity(entry.source, candidate.source);
      if (score >= best && (closest === undefined || score > best)) {
        closest = candidate;
        best = score;
      }
    }
    result.unused.push({
      source: entry.source,
      ...(entry.context === "" ? {} : { context: entry.context }),
      translation: entry.translation,
      ...(closest
        ? {
            closest: {
              source: closest.source,
              ...(closest.context === undefined ? {} : { context: closest.context }),
            },
          }
        : {}),
    });
  }
  return result;
}
