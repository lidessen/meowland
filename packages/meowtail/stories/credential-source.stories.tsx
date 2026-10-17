import { h } from "meowjsx";
import { defineStory } from "meowbook";
import { CredentialSource, Stack } from "meowtail";

export const CredentialSourceStory = defineStory({
  id: "credential-source",
  title: "凭据来源 · 环境引用与手动 Key",
  group: "表单",
  component: "CredentialSource",
  description: "宿主提供可用性；控件不查询环境或保存密钥。",
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
