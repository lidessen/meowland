import { h } from "meowjsx";
import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";
import { Select } from "./select";
import { Stack } from "./stack";

export interface CredentialSourceProps {
  id: string;
  source: "stored" | "environment";
  environmentName: string;
  apiKey: string;
  keepStored: boolean;
  hasStored: boolean;
  disabled?: boolean;
  variables?: { name: string; available: boolean | null }[];
  status?: string;
  onSourceChange(source: "stored" | "environment"): void;
  onEnvironmentChange(name: string): void;
  onKeyChange(value: string): void;
  onReplace(): void;
  onKeep?(): void;
  onCheck(): void;
}

/** Controlled credential editor. Discovery and secret persistence belong to the host. */
export function CredentialSource(props: CredentialSourceProps) {
  const { id, disabled } = props;
  return (
    <Stack gap="compact">
      <Field label="API Key 来源" htmlFor={`${id}-source`}>
        <Select
          id={`${id}-source`}
          value={props.source}
          disabled={disabled}
          onChange={(event: Event) =>
            props.onSourceChange(
              (event.target as HTMLSelectElement).value as "stored" | "environment",
            )
          }
        >
          <option value="stored">输入 API Key</option>
          <option value="environment">使用环境变量</option>
        </Select>
      </Field>
      {props.source === "environment" ? (
        <Stack gap="compact">
          <Field
            label="环境变量名"
            htmlFor={`${id}-environment`}
            description="只保存变量名引用，不复制 Key。读取服务运行环境，与浏览器所在机器无关。"
          >
            <Input
              id={`${id}-environment`}
              value={props.environmentName}
              disabled={disabled}
              autoComplete="off"
              list={`${id}-variables`}
              placeholder="例如 KIMI_API_KEY"
              onInput={(event: Event) =>
                props.onEnvironmentChange((event.target as HTMLInputElement).value)
              }
            />
          </Field>
          <datalist id={`${id}-variables`}>
            {props.variables?.map((variable) => (
              <option value={variable.name} />
            ))}
          </datalist>
          <Button
            type="button"
            variant="outline"
            style={{ alignSelf: "start" }}
            disabled={disabled}
            onClick={props.onCheck}
          >
            检查环境变量
          </Button>
          {props.variables?.map((variable) => (
            <span>
              {variable.name} ·{" "}
              {variable.available === null
                ? "在 WorkCell 运行环境中读取"
                : variable.available
                  ? "可用"
                  : "未设置"}
            </span>
          ))}
        </Stack>
      ) : props.keepStored && props.hasStored ? (
        <Stack gap="compact">
          <span>已保存 API Key</span>
          <Button
            type="button"
            variant="outline"
            style={{ alignSelf: "start" }}
            disabled={disabled}
            onClick={props.onReplace}
          >
            替换 API Key
          </Button>
        </Stack>
      ) : (
        <Field label="API Key" htmlFor={`${id}-key`} description="保存到凭据库，保存后不回显。">
          <Input
            id={`${id}-key`}
            type="password"
            value={props.apiKey}
            disabled={disabled}
            autoComplete="new-password"
            onInput={(event: Event) => props.onKeyChange((event.target as HTMLInputElement).value)}
          />
          {props.hasStored && props.onKeep ? (
            <Button type="button" variant="outline" disabled={disabled} onClick={props.onKeep}>
              保留已保存的 API Key
            </Button>
          ) : null}
        </Field>
      )}
      {props.status ? <span role="status">{props.status}</span> : null}
    </Stack>
  );
}
