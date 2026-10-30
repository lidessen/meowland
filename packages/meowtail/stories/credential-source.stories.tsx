import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { CredentialSource } from "meowtail";
import { Specimen, Specimens } from "./specimen";

export const CredentialSourceStory = defineStory({
  id: "credential-source",
  title: "Credential Source · Environment references and manual keys",
  group: "Forms and selection",
  groupOrder: 40,
  component: "CredentialSource",
  description:
    "The host reports availability; the control does not query the environment or store keys.",
  render() {
    const callbacks = {
      onSourceChange() {},
      onEnvironmentChange() {},
      onKeyChange() {},
      onReplace() {},
      onCheck() {},
    };
    return (
      <Specimens>
        <Specimen label="Environment variable" width="narrow">
          <CredentialSource
            {...callbacks}
            id="environment"
            source="environment"
            environmentName="KIMI_API_KEY"
            apiKey=""
            keepStored={false}
            hasStored={false}
            variables={[
              { name: "KIMI_API_KEY", available: true },
              { name: "OTHER_API_KEY", available: false },
              { name: "DIRECT_API_KEY", available: null },
            ]}
          />
        </Specimen>
        <Specimen label="Saved key" width="narrow">
          <CredentialSource
            {...callbacks}
            id="saved"
            source="stored"
            environmentName=""
            apiKey=""
            keepStored={true}
            hasStored={true}
          />
        </Specimen>
        <Specimen label="New key" width="narrow">
          <CredentialSource
            {...callbacks}
            id="new"
            source="stored"
            environmentName=""
            apiKey=""
            keepStored={false}
            hasStored={false}
          />
        </Specimen>
      </Specimens>
    );
  },
});
