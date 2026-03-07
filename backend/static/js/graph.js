export function drawGraph(nodes, edges) {
    const svg = d3.select("#graph-svg");
    svg.selectAll("*").remove();

    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(edges).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
        .selectAll("line")
        .data(edges)
        .enter().append("line")
        .attr("stroke", d => d.gap ? "#ec4899" : "#1e3a5f")
        .attr("stroke-opacity", d => d.gap ? 1 : 0.5)
        .attr("stroke-width", d => d.gap ? 2.5 : 1)
        .attr("stroke-dasharray", d => d.gap ? "5,4" : "none");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("r", 7)
        .attr("fill", "#1e3a8a")
        .attr("stroke", "#60a5fa")
        .attr("stroke-width", 1.5)
        .call(drag(simulation));

    node.append("title")
        .text(d => d.title);

    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }
        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }
        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }
        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}
