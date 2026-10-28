import { h } from "meowjsx";
import { Button } from "./button";
import { Field } from "./field";
import { Input } from "./input";
import { ListGroup, ListRow } from "./list-group";
import { Select } from "./select";
import { Stack } from "./stack";
import { Status } from "./status";
import { elementId } from "../shared/element-id";

export interface CredentialSourceProps {
  /** Base id for the ARIA references this component wires; generated when omitted. */
  id?: string;
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
  const { id = elementId("credential-source"), disabled } = props;
  return (
    <Stack gap="compact">
      <Field label="API Key source" htmlFor={`${id}-source`}>
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
          <option value="stored">Enter an API key</option>
          <option value="environment">Use an environment variable</option>
        </Select>
      </Field>
      {props.source === "environment" ? (
        <Stack gap="compact">
          <Field
            label="Environment variable name"
            htmlFor={`${id}-environment`}
            description="Stores only the variable name reference; never copies the key. Reads the service runtime environment, independent of the browser machine."
          >
            <Input
              id={`${id}-environment`}
              value={props.environmentName}
              disabled={disabled}
              autoComplete="off"
              list={`${id}-variables`}
              placeholder="For example, KIMI_API_KEY"
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
            Check environment variable
          </Button>
          {props.variables?.length ? (
            // The host's check result: one row per variable, its state as the shared badge.
            <ListGroup aria-label="Environment variables">
              {props.variables.map((variable) => (
                <ListRow
                  title={<code>{variable.name}</code>}
                  description={
                    variable.available === null
                      ? "Read from the WorkCell runtime environment"
                      : undefined
                  }
                  status={
                    variable.available === null ? (
                      <Status state="unknown" label="At runtime" />
                    ) : variable.available ? (
                      <Status state="success" label="Available" />
                    ) : (
                      <Status state="warning" label="Not set" />
                    )
                  }
                />
              ))}
            </ListGroup>
          ) : null}
        </Stack>
      ) : props.keepStored && props.hasStored ? (
        <ListRow
          title="Saved API Key"
          description="Kept in the credential store; never shown again."
          status={<Status state="success" label="Saved" />}
          actions={
            <Button
              type="button"
              variant="outline"
              size="small"
              disabled={disabled}
              onClick={props.onReplace}
            >
              Replace API Key
            </Button>
          }
        />
      ) : (
        <Field
          label="API Key"
          htmlFor={`${id}-key`}
          description="Saved to the credential store; never shown again after saving."
        >
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
              Keep the saved API Key
            </Button>
          ) : null}
        </Field>
      )}
      {props.status ? <span role="status">{props.status}</span> : null}
    </Stack>
  );
}
