import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { CredentialSource, Stack } from "meowtail";

export const CredentialSourceStory = defineStory({
  id: "credential-source",
  title: "Credential source · Environment references and manual keys",
  group: "Forms",
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
      <Stack style={{ maxWidth: "480px", padding: "24px" }} gap="normal">
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
        <CredentialSource
          {...callbacks}
          id="saved"
          source="stored"
          environmentName=""
          apiKey=""
          keepStored={true}
          hasStored={true}
        />
        <CredentialSource
          {...callbacks}
          id="new"
          source="stored"
          environmentName=""
          apiKey=""
          keepStored={false}
          hasStored={false}
        />
      </Stack>
    );
  },
});
