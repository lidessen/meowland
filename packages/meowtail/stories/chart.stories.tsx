import { h } from "meowjsx";
import { signal } from "meowjsx/signal";
import { defineStory } from "meowbook";
import { ActionRow, Button, Chart, type ChartSeries } from "meowtail";
import { Specimen, Specimens } from "./specimen";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const ChartStory = defineStory({
  id: "chart",
  title: "Chart · Compare and follow a trend",
  component: "Chart",
  group: "Content",
  groupOrder: 60,
  description:
    "Bars compare categories and a line follows a trend. A legend names each series, line markers differ by shape, arrow keys read each category aloud, and Show data opens every value as a table. The host supplies the data and its units.",
  covers: ["Chart bar", "Chart line", "missing value", "keyboard readout", "data table"],
  render: () => {
    const latency = signal<readonly ChartSeries[]>([
      { id: "p50", label: "Median", values: [120, 118, 131, 125, 140, 138, 129] },
      { id: "p95", label: "95th percentile", values: [310, 290, 355, 330, 402, 380, 344] },
    ]);
    return (
      <Specimens>
        <Specimen label="Comparison">
          <Chart
            type="bar"
            label="Tasks completed by team"
            description="This quarter; Support has not reported March yet."
            categories={["Design", "Platform", "Support", "Research"]}
            series={[
              { id: "jan", label: "January", values: [42, 61, 38, 17] },
              { id: "feb", label: "February", values: [48, 57, 44, 21] },
              { id: "mar", label: "March", values: [51, 66, null, 25] },
            ]}
          />
        </Specimen>
        <Specimen label="Trend">
          <Chart
            type="line"
            label="Monthly active readers"
            unit="k"
            categories={months}
            series={[
              {
                id: "readers",
                label: "Readers",
                values: [12.4, 13.1, 14.8, 14.2, 16.9, 18.3, 17.7, 19.2, 21.4, 22.8, 24.1, 26.5],
              },
            ]}
          />
        </Specimen>
        <Specimen
          label="Host updates"
          note="The host replaces the values; marks keep their identity."
        >
          <Chart
            type="line"
            label="Response time"
            unit=" ms"
            height={200}
            categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            series={latency}
          />
          <ActionRow>
            <Button
              variant="outline"
              size="small"
              onClick={() => {
                latency.value = latency.value.map((entry) => ({
                  ...entry,
                  values: entry.values.map((value) =>
                    value === null ? null : Math.round(value * (0.85 + Math.random() * 0.3)),
                  ),
                }));
              }}
            >
              New week
            </Button>
          </ActionRow>
        </Specimen>
      </Specimens>
    );
  },
});
