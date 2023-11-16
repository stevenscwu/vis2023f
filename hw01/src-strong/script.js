// 設定圖表的尺寸和邊距
const margin = { top: 80, right: 70, bottom: 60, left: 90 };
const width = 1500 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// 設定 x 和 y 比例尺
const x = d3.scaleTime().range([-10, width]);
const y = d3.scaleLinear().range([height, 0]);

// 設定折線產生器
const line = d3.line()
  .x(d => x(d.序號))
  .y(d => y(d.總分));

// 創建 SVG 元素並將其附加到圖表容器
const svg = d3.select("#chart-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);
  

// 創建工具提示 div
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip");

/// 加載和處理數據
d3.csv("../data.csv").then(data => {
  data.forEach(d => {
    d.序號 = +d.序號;
    d.作業一 = +d.作業一;
    d.作業二 = +d.作業二;
    d.作業三 = +d.作業三;
    d.作業四 = +d.作業四;
    d.作業五 = +d.作業五;
    d.作業六 = +d.作業六;
    d.作業七 = +d.作業七;
    d.作業八 = +d.作業八;
    d.作業九 = +d.作業九;
    d.作業十 = +d.作業十;

    // 計算總分
    d.總分 = (d.作業一 + d.作業二 + d.作業三 + d.作業四 + d.作業五 + d.作業六 + d.作業七 + d.作業八 + d.作業九 + d.作業十);
  });
  // 重新定義 x 和 y 的比例尺
  x.domain(d3.extent(data, d => d.序號)); // 設定 x 軸比例尺
  y.domain([0, d3.max(data, d => d.總分)]); // 設定 y 軸比例尺

  // 計算 x 軸的刻度值，以 10 為單位，從 1 到 120
  const xTickValues = d3.range(0, 125, 5);

  // 添加 x 軸
  svg.append("g")
    .attr("transform", `translate(0,${height + 15})`) // 在y軸下方偏移10個單位
    .style("font-size", "16px")
    .call(d3.axisBottom(x)
      .tickValues(xTickValues) // 設定自訂刻度值
      .tickFormat(d3.format("d"))) // 使用整數格式顯示刻度標籤
    .call(g => g.select(".domain").remove())
    .selectAll(".tick line")
    .style("stroke-opacity", 0);
  svg.selectAll(".tick text")
    .attr("fill", "#777");

  // 添加垂直網格線
  svg.selectAll("xGrid")
    .data(x.ticks(20).slice(0))
    .join("line")
    .attr("x1", d => x(d))
    .attr("x2", d => x(d))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);

  // 添加右側 y 軸
  svg.append("g")
    .style("font-size", "16px")
    .attr("transform", `translate(${width + 10},0)`) // 移動 y 軸到右側
    .call(d3.axisRight(y)
      .tickValues(d3.range(0, 70, 5))
      .tickFormat(d => `${d}`)
      .tickSize(0)
      .tickPadding(10))
    .call(g => g.select(".domain").remove()) // 移除 y 軸線
    .selectAll(".tick text")
    .style("fill", "#777")
    .style("visibility", "visible");

  // 添加 Y 軸標題
  svg.append("text")
    .attr("transform", "rotate(360)") // 旋轉文字，讓它水平顯示
    .attr("x", width + 30) // 調整 x 座標以移動文字到右側
    .attr("y", -20) // 將文字移動到 y 軸最頂端
    // .attr("x", -height / 2) // 將文字水平放置在 y 軸的中間位置
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "#777")
    .style("font-family", "sans-serif")
    .text("總分"); // 更新標題文字

  // 添加水平網格線
  svg.selectAll("yGrid")
    .data(y.ticks((d3.max(data, d => d.作業一) - 0) / 5000).slice(1))
    .join("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => y(d))
    .attr("y2", d => y(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 0.5);
  
  // 添加折線路徑
  const path = svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#FF5809")
    .attr("stroke-width", 1)
    .attr("d", line);
  
  //新增面積圖
  const area = d3.area()
    .x(d => x(d.序號))
    .y1(d => y(d.總分))
    .y0(y(0)); // 填充到y軸的底部
  
  // 創建漸層定義
  const defs = svg.append("defs"); // 創建漸層定義再SVG内部

  const linearGradient = defs.append("linearGradient") // 创建线性渐变
    .attr("id", "area-gradient") // 为渐变指定唯一的 ID
    .attr("x1", "20%") // 漸層起點 x 座標
    .attr("y1", "70%") // 漸層起點 y 座標
    .attr("x2", "20%") // 漸層終點 x 座標
    .attr("y2", "100%"); // 漸層終點 y 座標

  linearGradient.append("stop") // 添加渐变的起始颜色
    .attr("offset", "0%") // 渐变起点位置，0% 表示底部
    .style("stop-color", "#FF8040")
    .style("stop-opacity", 0.8); // 设置底部颜色

  linearGradient.append("stop") // 添加渐变的结束颜色
    .attr("offset", "100%") // 渐变终点位置，100% 表示顶部
    .style("stop-color", "#FFD1A4")
    .style("stop-opacity", 0.9); 

  // 添加面积图
  svg.append("path")
    .datum(data)
    .attr("class", "area")
    .attr("d", area)
    .style("fill", "url(#area-gradient)"); // 使用渐变填充色

  
  // 添加圓圈元素
  const circle = svg.append("circle")
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("stroke", "white")
    .attr("opacity", 0.7)
    .style("pointer-events", "none");

  // 創建一個監聽矩形
  const listeningRect = svg.append("rect")
    .attr("width", width)
    .attr("height", height);

  // 創建鼠標滑過事件處理程序
  listeningRect.on("mousemove", function (event) {
    const [xCoord] = d3.pointer(event, this);
    const bisectDate = d3.bisector(d => d.序號).left;
    const x0 = x.invert(xCoord);
    const i = bisectDate(data, x0, 1);
    const d0 = data[i - 1];
    const d1 = data[i];
    const d = x0 - d0.序號 > d1.序號 - x0 ? d1 : d0;
    const xPos = x(d.序號);
    const yPos = y(d.總分);

  // 更新圓圈位置
  circle.attr("cx", xPos)
    .attr("cy", yPos);

  // 為圓圈半徑添加過渡效果
  circle.transition()
    .duration(50)
    .attr("r", 5);

  // 更新工具提示的位置
  tooltip
    .style("display", "block")
    .style("left", `${xPos + 100}px`)
    .style("top", `${yPos + 50}px`)
    .html(`<strong>序號:</strong> ${d.序號}<br><strong>作業成績:</strong> ${d.總分 !== undefined ? d.總分 : 'N/A'}`);
  });

  // 鼠標離開監聽矩形時的處理函數
  listeningRect.on("mouseleave", function () {
    circle.transition()
      .duration(50)
      .attr("r", 0);

    tooltip.style("display", "none");
  });

  // 添加圖表標題
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2) // 設置 x 座標為中央
    .attr("y", margin.top - 100)
    .style("font-size", "30px")
    .style("font-weight", "bold") // 加粗字體
    .style("font-family", "sans-serif")
    .style("text-anchor", "middle") // 將文字置中對齊
    .text("作業成績表");

  // 添加數據來源註釋
  svg.append("text")
    .attr("class", "source-credit")
    .attr("x", width - 1125)
    .attr("y", height + margin.bottom - 3)
    .style("font-size", "9px")
    .style("font-family", "sans-serif")
});

// src: https://github.com/datavizdad/d3linechartseries/tree/main
