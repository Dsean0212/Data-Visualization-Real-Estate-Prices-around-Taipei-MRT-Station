//
let mapLeft = 0, mapTop = 0;
let mapTotalWidth = 1000, mapTotalHeight = 800;
let mapMargin = {top: 10, right: 10, bottom: 10, left: 10},
    mapWidth = mapTotalWidth - mapMargin. left - mapMargin. right,
    mapHeight = mapTotalHeight - mapMargin. top - mapMargin. bottom;

let barLeft = 1000, barTop = 500; 
let barTotalWidth = 1000, barTotalHeight = 300;
let barMargin = {top: 30, right: 30, bottom: 50, left: 30},
    barWidth = barTotalWidth - barMargin.left - barMargin.right,
    barHeight = barTotalHeight - barMargin.top - barMargin.bottom;

let scatterLeft = 1000, scatterTop = 0;
let scatterTotalWidth = 1000, scatterTotalHeight = 500;
let scatterMargin = {top: 30, right: 30, bottom: 30, left: 30},
    scatterWidth = scatterTotalWidth - scatterMargin.left - scatterMargin.right,
    scatterHeight = scatterTotalHeight - scatterMargin.top - scatterMargin.bottom;

let lineLeft = 1000, lineTop = 0;
let lineTotalWidth = 1000, lineTotalHeight = 500;
let lineMargin = {top: 30, right: 30, bottom: 50, left: 30},
    lineWidth = lineTotalWidth - lineMargin. left - lineMargin. right,
    lineHeight = lineTotalHeight - lineMargin. top - lineMargin. bottom;

d3.csv("superHousing.csv").then(house_rawData =>{
      //整理房價資料(all data version)

      let house = house_rawData.map(d=>{

        //make the array into proper type
        d.station = String(d.st_range).split("");
        station = [];
        for(var i = 0; i < (d.station).length; i++){
            if((d.station[i] != '[') & (d.station[i] != ']') & (d.station[i] != '"') & (d.station[i] != ' ') & (d.station[i] != "'")){
                station.push(d.station[i]);
            }
        }
        if(station.length != 0){
            d.station = station.join("").split(",");
        }else{d.station = station;}

    //     for(var i = 0; i < (d.station).length; i++){
    //       index = st_name.indexOf(d.station[i]);
    //       st_amount[index] += d.Tprice;
    //       st_count[index] ++;
    //   }
        
        return {
          "num":String(d['編號']),
          "address":d['土地位置建物門牌'],
          "lat":Number(d['Latitude']),
          "lon":Number(d['Longitude']),
          "date":d['交易年月日'],
          "complete_date":d['建築完成年月'],
          "price":Number(d['總價元']),
          "u_price":Number(d['單價元平方公尺']),
          "station":d.station,
          
        };
        
    });

    var max_uprice = d3.max(house, function(d) { return d.u_price; });
    var min_uprice = d3.min(house, function(d) { return d.u_price; });
    // min_price=50000;
    console.log(max_uprice)
    console.log(min_uprice)


d3.csv("MRT_new.csv").then(rawData =>{

    rawData.forEach(function(d){

      //data for map
      d.color = String(d.color);
      d.lat = Number(d.lat);
      d.lon = Number(d.lon);
      d.line_code=String(d.line_code);
      d.index=Number(d.index);
    });

    let plotData = rawData.map(d=>{
        return {
            
            //map data
            "color" : d.color,
            "lat" : d.lat,
            "lon" : d.lon,
            "line_code" : d.line_code,
        };
    });

    //checking data
    // console.log(rawData); 
    // console.log(plotData);

    ///map graph start///
    tpMap = d3.select('svg')
              .append('g')
              .attr("transform", `translate(${mapLeft},${mapTop})`)

    d3.json("taipei.json").then(drawTaipei);

    function drawTaipei(taipei) {

      var projection = d3.geoMercator()
          .fitExtent([[0,0], [mapWidth, mapHeight]], taipei);
    
      var geoGenerator = d3.geoPath()
          .projection(projection);
  
      var paths = tpMap
          .selectAll('path')
          .data(taipei.features)
          .enter()
          .append('path')
          .attr('stroke', "#335C49")
          .attr('fill', '#BDDBCD')
          .attr('d', geoGenerator);
  
      var perfectPin = "M 4 2 Q 3 3 2 10 c 0 13 9 6 2 -8"
      var perfectPin2="m6 0c-2.099 0-4 1.702-4 3.801 0 2.099 1.734 4.605 4 8.199 2.265-3.594 4-6.1 4-8.199 0-2.099-1.901-3.801-4-3.801zm0 5.5c-.828 0-1.5-.671-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.671 1.5-1.5 1.5z"

      circle_color = d3.scaleLinear()
                    .domain([min_uprice,100000,200000,max_uprice])
                    .range([0,0.2,0.8,1])
                    
      //捷運顏色這邊可以設定
      MRT_color = d3.scaleOrdinal()
                    .domain(['BR','R','G','O','BL','Y'])
                    .range(['#c48c31','#e3002c','#008659','#f8b61c','#0070bd','#ffdb00'])

      plotPin = tpMap.append('g')
                      .selectAll(".pushpin")
                      .data(plotData).enter()
                      .append("path")
                      .attr("class",".pushpin")
                      .attr("d", perfectPin)
                      .attr("fill", function(d, i){
                        return MRT_color(d.line_code);})
                  //  .attr("fill", function(d){return [d.color]})
                      .attr("stroke", "black")
                      .attr("transform", function(d){ return `translate(${projection([d.lon,d.lat])[0]},${projection([d.lon,d.lat])[1]})`})
           

      plotPin_house = tpMap.append('g')
         .selectAll(".pushpin_house")
         .data(house).enter()
         .append("circle")
         .attr("cx", function(d,){ return projection([d.lon,d.lat])[0]})
          .attr("cy", function(d, i){ return projection([d.lon,d.lat])[1]})
         .attr("class",".pushpin_house")
         .attr("r", 2.5)
         .attr("fill", function(d, i){
            return d3.interpolateOrRd(circle_color(d.u_price));})
    //  .attr("fill", "#FFB7C3")
    //  .attr("stroke", "#9D91A3")

         
      var tip = d3.tip()
                  .attr('class','d3-tip')
                  .html(d=>(d.address +"<br/>"+"Price: "+d.price +"<br/>"+d.date));

      plotPin_house.call(tip);

      plotPin_house.on('mouseover', tip.show)
                    .on('mouseout', tip.hide)
    
    
    }
    ///map graph end///

    


  }//end of csv load.

  ).catch(function(error){
      console.log(error);
  });


}).catch(function(error){
  console.log(error);
});

////bar chart start////

d3.csv("MRT_new.csv").then(data_st =>{

  function removeDuplicates(arr) {
      return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  data_st.forEach(function(d){
      d.st_name = String(d.station_name_tw);
      d.throughput = Number(d.throughput);
      d.index=Number(d.index);
      d.line_code=String(d.line_code);
  });

  //sort the x-axis by throughput
  data_st.sort((a, b) => d3.descending(a.throughput, b.throughput));

  //make the station name list and the station throughput list
  st_name = [];
  st_throughput = [];
  data_st.forEach(function(d){
      st_name.push(d.st_name);
      st_throughput.push(d.throughput);
  });

  st_name = removeDuplicates(st_name);
  console.log(st_name);
  st_throughput =removeDuplicates(st_throughput);

  //initalize arrays, preparing for the calculation of average Tprice
  st_amount = [];
  st_count = [];
  st_avg_Tprice = [];
  for(var i = 0; i < (st_name).length; i++){
      st_amount.push(0);
      st_count.push(0);
      st_avg_Tprice.push(0);
  }

}).catch(function(error){
  console.log(error);
});

d3.csv("superHousing.csv").then(data =>{
    //console.log(data);
    
    //data preprocessing
    data.forEach(function(d){

        d.Tprice = Number(d.總價元);
        d.Uprice = Number(d.單價元平方公尺) / 1000;
        d.Built = Number(d.建築完成年月);
        d.Deal = Number(d.交易年月日);
        
        //set the data without 建築完成年月 to null
        if(d.Built < 10000){
            d.Built = null;
        }
   
        //make the array into proper type
        d.station = String(d.st_range).split("");
        station = [];

        for(var i = 0; i < (d.station).length; i++){
            if((d.station[i] != '[') & (d.station[i] != ']') & (d.station[i] != '"') & (d.station[i] != ' ') & (d.station[i] != "'")){
                station.push(d.station[i]);
            }
        }
        
        if(station.length != 0){
            d.station = station.join("").split(",");
        }else{d.station = station;}

        //calculate the sum of Tprice and count the appearance of each station
        for(var i = 0; i < (d.station).length; i++){
            index = st_name.indexOf(d.station[i]);
            st_amount[index] += d.Tprice;
            st_count[index] ++;
        }

    });

    //console.log(st_amount);
    //console.log(st_count);

    //calculate the average Tprice (million)
    for(var i = 0; i < (st_count).length; i++){
        if(st_count[i] != 0){
            st_avg_Tprice[i] = Math.round(st_amount[i] / st_count[i]) / 1000000;
        }
    }
    console.log(st_avg_Tprice);

    //set the html elements
    const svgBar = d3.select("svg")
                     .append("svg");
                
    const gBar = svgBar.append("g")
                       .attr("transform", `translate(${barLeft},${barTop})`);

    //set the Yscale and Xscale
    barYScale = d3.scaleLinear()
                   .domain([d3.max(st_avg_Tprice), 0])
                   .range([0, barHeight]);
    let barYaxis = d3.axisLeft(barYScale).ticks(9);

    barXScale = d3.scaleBand()
                   .domain(st_name)
                   .range([0, barWidth]);
    let barXaxis = d3.axisBottom(barXScale);

    //append y-axis and x-axis
    gbarYaxis = gBar.append("g") 
                      .attr("transform", `translate(${barMargin.left},${barMargin.top})`)
                      .call(barYaxis);  
    
    gbarXaxis = gBar.append("g") 
                      .attr("transform", `translate(${barMargin.left},${barMargin.top + barHeight})`)
                      .attr("id", "xLabel")
                      .call(barXaxis)
                      .selectAll("text")
                        .attr("y", "10")
                        .attr("x", "-5")
                        .attr("font-size", "6px")
                        .attr("text-anchor", "end")
                        .attr("transform", "rotate(-40)")

    //yLabel
    gbarYaxis.append("text")
             .attr("x", -(barHeight/2))
             .attr("y", -(barMargin.left))
             .attr("text-anchor", "middle")
             .attr("fill","black")
             .attr("transform", "rotate(-90)")
             .text("The Average Total Price (million NTD)");

    //xLabel
    d3.select("#xLabel").append("text")
      .attr("x", barWidth/2)
      .attr("y", barMargin.bottom + barMargin.top/4)
      .attr("fill","black")
      .text("MRT Station");

    //new data for bar
    var bar_Dt = [];
    for(var i = 0; i < st_name.length; i++){
        bar_Dt.push({price: st_avg_Tprice[i], name: st_name[i], throughput: st_throughput[i]});
    }

    //color
    var barcolor = d3.scaleSequential().domain([d3.min(bar_Dt, d=>d.throughput), d3.max(bar_Dt, d=>d.throughput)]).interpolator(d3.interpolateBuPu);

    //rects
    const rects = svgBar.append("g").attr("id", "barchart")
                        .attr("transform", `translate(${barLeft + barMargin.left},${barTop + barMargin.top})`)
                        .selectAll("rect").data(bar_Dt);

    rects_for_sec = rects.enter().append("rect")
                         .attr("y", (d)=>barYScale(d.price))
                         .attr("x", (d) => barXScale(d.name))
                         .attr("width", barXScale.bandwidth)
                         .attr("height", (d)=>barHeight - barYScale(d.price))
                         .attr("fill", (d)=>barcolor(d.throughput))
                         .attr("stroke", "black");

    ////scatter plot start////  
    const svg = d3.select("svg")
    .append("svg")
           //.attr("width", scatterTotalWidth)
           //.attr("height", scatterTotalHeight); 
  
    D = scatterWidth+scatterMargin.left*2; //strange bug  
    let plotDt = data.map(d=>{
        return {
            "Uprice" : d.Uprice,
            "Tprice" : d.Tprice,
            "Built" : d.Built,
            "Deal" : d.Deal,
        };
    });  
    //console.log(plotDt);  
    const svgPlot = d3.select("svg")
                  .append("svg")  
    const gPlot = svgPlot.append("g")
                 .attr("transform", `translate(${scatterLeft + scatterMargin.left}, ${scatterTop + scatterMargin.top})`);  
    const Xscale = d3.scaleLinear()
                     .domain([d3.min(plotDt, d=>d.Built), d3.max(plotDt, d=>d.Built)])
                     .range([scatterWidth, 0]);
    scatterXaxis = d3.axisBottom(Xscale).tickFormat("");//.tickValues([110, 105, 100, 95, 90, 85, 80, 75, 70, 65, 60, 55]);  
    const Yscale = d3.scaleLinear()
                     .domain([d3.min(plotDt, d=>d.Uprice), d3.max(plotDt, d=>d.Uprice)])
                     .range([scatterHeight, 0]);
    scatterYaxis = d3.axisLeft(Yscale);  
    //append y-axis and x-axis
    gscatterYaxis = gPlot.append("g") 
                      //.attr("transform", `translate(${scatterMargin.left},${scatterMargin.top})`)
                      .call(scatterYaxis);    
    gscatterXaxis = gPlot.append("g") 
                      .attr("transform", "translate(0," + scatterHeight + ")")
                      .attr("id", "xLabel_sc")
                      .call(scatterXaxis)
                      .selectAll("text")
                        .attr("y", "10")
                        .attr("x", "-5")
                        .attr("font-size", "8px")
                        .attr("text-anchor", "end")
                        //.attr("transform", "rotate(-40)")  
    //yLabel
    gscatterYaxis.append("text")
             .attr("x", -(scatterHeight/2))
             .attr("y", -(scatterMargin.left))
             .attr("text-anchor", "middle")
             .attr("fill","black")
             .attr("transform", "rotate(-90)")
             .text("The Unit Price (thousand NTD / sq m)");  
    //xLabel
    d3.select("#xLabel_sc").append("text")
      .attr("x", scatterWidth/2)
      .attr("y", scatterMargin.bottom + scatterMargin.top/4)
      .attr("fill","black")
      .text("Date from Recent to Previous");  
    //tooltips
    var tip = d3.tip()
            .attr('class', 'd3-tip')
            .html(d=>("Unit Price: " + d.Uprice + "<br />MRT station nearby: " + d.station + "<br />" + d.Built));  
    //brush
    var brush = d3.brush()
                  .extent([[scatterMargin.left + D, scatterMargin.top], [scatterWidth+scatterMargin.left + D, scatterHeight+scatterMargin.top]])
                  .on("start", brushed)
                  .on("brush", brushed)
                  .on("end", endbrushed);  
    let choosed = []; 
    let choosed_temp = [];  
    function brushed() {
      var extent = d3.event.selection;
      //console.log(extent);
      choosed = [];
      choosed_temp = [];
      circles_for_sec
        .classed("selected", function(d) { 
          selected = (Xscale(d.Built)+scatterMargin.left + D) >= extent[0][0] && 
                    (Xscale(d.Built)+scatterMargin.left + D) <= extent[1][0] && 
                    (Yscale(d.Uprice)+scatterMargin.top) >= extent[0][1] && 
                    (Yscale(d.Uprice)+scatterMargin.top) <= extent[1][1];
          if (selected){ 
              let obj = new Object();
                  obj.x = d.Built;
                  obj.y = d.Uprice;
                  choosed.push(obj);
                  choosed_temp.push(obj);
          }
          return selected;
        }); 
      //console.log(choosed);
      //console.log(choosed_temp);
    };  
    //color
    //var plotcolor = d3.scaleSequential().domain([d3.min(plotDt, d=>d.Deal), d3.max(plotDt, d=>d.Deal)]).interpolator(d3.interpolateReds);  
    var circles = svgPlot.append("g").attr("id", "scatterplot").selectAll("circle").data(plotDt);  
    svgPlot.select("#scatterplot").call(tip)
                              .call(brush);  
    circles_for_sec = circles.enter().append("circle")
                             .attr("cx", (d)=>Xscale(d.Built)+scatterMargin.left + D)
                             .attr("cy", (d)=>Yscale(d.Uprice)+scatterMargin.top)
                             .attr("r", 2)
                             .attr("fill", "red")//(d)=>plotcolor(d.Deal)
                             .on('mouseover', tip.show)
                             .on('mouseout', tip.hide)  
/*  
    ///line chart start///
    const svgLine = d3.select("svg")
                      .append("svg");

    const gLine = svgLine.append("g")
                        .attr("transform", `translate(${lineLeft},${lineTop})`);
    
    lineYScale = d3.scaleLinear()
                  .domain([d3.max(st_avg_Tprice), 0])
                  .range([0, lineHeight]);
    let lineYaxis = d3.axisLeft(lineYScale).ticks(10);
       
    lineXScale = d3.scaleBand()
                  .domain(1,10)
                  .range([0, lineWidth]);
    let lineXaxis = d3.axisBottom(lineXScale);

    //append y-axis and x-axis
    gLineYaxis = gLine.append("g") 
                      .attr("transform", `translate(${lineMargin.left},${lineMargin.top})`)
                      .call(lineYaxis);  

    gLineXaxis = gLine.append("g") 
                    .attr("transform", `translate(${lineMargin.left},${lineMargin.top + lineHeight})`)
                    .attr("id", "lineXLabel")
                    .call(lineXaxis)
                    .selectAll("text")
                    .attr("y", "10")
                    .attr("x", "-5")
                    .attr("font-size", "6px")
                    .attr("text-anchor", "end")
                    // .attr("transform", "rotate(-40)")

    //yLabel
    gLineYaxis.append("text")
              .attr("x", -(lineHeight/2))
              .attr("y", -(lineMargin.left))
              .attr("text-anchor", "middle")
              .attr("fill","black")
              .attr("transform", "rotate(-90)")
              .text("The Average Total Price (million NTD / sq m)");

    //xLabel
    d3.select("#lineXLabel").append("text")
      .attr("x", lineWidth/2)
      .attr("y", lineMargin.bottom + lineMargin.top/4)
      .attr("fill","black")
      .text("MRT Station index");


    data_for_line = d3.nest() // nest function allows to group the calculation per level of a factor
      .key(function(d) { return d.name;})
      .entries(data);

    MRT_color = d3.scaleOrdinal()
                    .domain(['BR','R','G','O','BL','Y'])
                    .range(['#c48c31','#e3002c','#008659','#f8b61c','#0070bd','#ffdb00'])

    
        

    //   let line = gLine.selectAll(".line")
    //                 .data(sumstat)
    //                 .enter()
    //                 .append("path")
    //                 .attr("fill", "none")
    //                 .attr("stroke", function(d){ return color(d.line_code) })
    //                 .attr("stroke-width", 1.5)
    //                 .attr("d", function(d){
    //                     return d3.line()
    //                 .x(function(d) { return x(d.year); })
    //                 .y(function(d) { return y(+d.n); })
    //                 (d.values)
    //     })



    ////line chart end////
*/

    //////////////////////////////////////////////////LINK

    function endbrushed() {

      ////barchart

      //new data for brush
      let new_Dt = data.map(d=>{
        return {
            "Tprice" : d.Tprice,
            "Uprice" : d.Uprice,
            "Built" : d.Built,
            "station" : d.station,
        };
      });

      new_Dt.forEach(function(d){
        for(var i = 0; i < choosed_temp.length; i++){
          //console.log(choosed_temp[i].x, choosed_temp[i].y);
          if((d.Built === choosed_temp[i].x) && (d.Uprice === choosed_temp[i].y)){
            //console.log(choosed_temp);
            choosed_temp.shift();
            return d.sec = 1;
          }else{return d.sec = 0;}
        }
      });

      //console.log(new_Dt);

      st_amount = [];
      st_count = [];
      st_avg_Tprice = [];
      for(var i = 0; i < (st_name).length; i++){
          st_amount.push(0);
          st_count.push(0);
          st_avg_Tprice.push(0);
      }

      new_Dt.forEach((x) => {
        
        if(x.sec === 1){
            for(var i = 0; i < (x.station).length; i++){
                index = st_name.indexOf(x.station[i]);
                st_amount[index] += x.Tprice;
                st_count[index] ++;
            }
        }

      });

      //calculate the average Tprice (million)
      for(var i = 0; i < (st_count).length; i++){
          if(st_count[i] != 0){
              st_avg_Tprice[i] = Math.round(st_amount[i] / st_count[i]) / 1000000;
          }
      }

      //new data for bar
      var new_bar_Dt = [];
      for(var i = 0; i < st_name.length; i++){
          new_bar_Dt.push({price: st_avg_Tprice[i], name: st_name[i], throughput: st_throughput[i]});
      }

      console.log(new_bar_Dt);

      new_barYScale = d3.scaleLinear()
                   .domain([d3.max(st_avg_Tprice), 0])
                   .range([0, barHeight]);

      rects_for_sec.data(new_bar_Dt).transition().duration(1000)
                   .attr("y", (d)=>new_barYScale(d.price))
                   .attr("x", (d) => barXScale(d.name))
                   .attr("width", barXScale.bandwidth)
                   .attr("height", (d)=>barHeight - new_barYScale(d.price))
                   .attr("fill", (d)=>barcolor(d.throughput))
                   .attr("stroke", "black");

      //y-axis update
    
      let new_barYaxis = d3.axisLeft(new_barYScale).ticks(9);
      gbarYaxis.transition().duration(1000).call(new_barYaxis);

    }


}).catch(function(error){
  console.log(error);
});

////bar chart end////

