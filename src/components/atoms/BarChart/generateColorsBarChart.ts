export function generateColorsBarChart(length: number) {
  const result = [];
  const colors = ["#004A55", "#00ADB4", "#B6DFDF"];
  const colorCount = colors.length;

  for (let i = 0; i < length; i++) {
    const colorIndex = i % colorCount;
    result.push(colors[colorIndex]);
  }

  return result;
}
