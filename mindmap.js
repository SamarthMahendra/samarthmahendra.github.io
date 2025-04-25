// Interactive Mind Map using D3.js
document.addEventListener('DOMContentLoaded', function() {
  // Only run if mindmap container exists
  const mindmapContainer = document.getElementById('mindmap-container');
  if (!mindmapContainer) return;

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'mindmap-tooltip';
  mindmapContainer.appendChild(tooltip);

  // Mind map data structure - defines the whole knowledge graph
  const data = {
    name: "Samarth Mahendra",
    icon: "fa-user",
    color: "#8A2BE2", // Purple (main color)
    description: "Software Engineer with expertise in backend development, distributed systems, and LLMs.",
    children: [
      {
        name: "Backend Development",
        icon: "fa-server",
        color: "#9370DB", // Medium purple
        description: "Expert in building scalable and efficient backend systems using Python and Node.js.",
        children: [
          { 
            name: "Python", 
            icon: "fa-python", 
            color: "#6A5ACD", // Slate blue
            description: "Advanced Python developer with experience in Django, FastAPI, Flask, and other frameworks.",
            children: [
              { name: "Django", icon: "fa-code", color: "#483D8B", description: "Built RESTful APIs and web applications using Django and Django REST Framework." },
              { name: "FastAPI", icon: "fa-bolt", color: "#5D478B", description: "Developed high-performance async APIs with FastAPI for real-time applications." },
              { name: "Flask", icon: "fa-flask", color: "#5E5A80", description: "Created lightweight web services and microservices using Flask." }
            ]
          },
          { 
            name: "Node.js", 
            icon: "fa-node-js", 
            color: "#7B68EE", // Medium slate blue
            description: "Developed scalable server-side applications using Node.js and Express.",
            children: [
              { name: "Express", icon: "fa-code", color: "#473C8B", description: "Built REST APIs and web servers using Express.js framework." },
              { name: "TypeScript", icon: "fa-code", color: "#6959CD", description: "Used TypeScript for type-safe JavaScript development." }
            ]
          },
          { 
            name: "Databases", 
            icon: "fa-database", 
            color: "#9683EC",
            description: "Expertise in SQL and NoSQL databases, data modeling, and query optimization.",
            children: [
              { name: "PostgreSQL", icon: "fa-database", color: "#614051", description: "Deep knowledge of PostgreSQL for transactional workloads." },
              { name: "MongoDB", icon: "fa-database", color: "#5A4A78", description: "Document database expertise for flexible schema requirements." },
              { name: "Redis", icon: "fa-database", color: "#614C63", description: "In-memory data store for caching and real-time data." },
              { name: "Elasticsearch", icon: "fa-search", color: "#563C5C", description: "Search engine for full-text search capabilities." }
            ]
          }
        ]
      },
      {
        name: "Distributed Systems",
        icon: "fa-network-wired",
        color: "#BA55D3", // Medium orchid
        description: "Design and implementation of scalable distributed systems and microservices.",
        children: [
          { 
            name: "Celery", 
            icon: "fa-tasks", 
            color: "#9966CC",
            description: "Task queue implementation for distributed job processing with Celery workers."
          },
          { 
            name: "Kubernetes", 
            icon: "fa-dharmachakra", 
            color: "#8068B1",
            description: "Container orchestration for deploying, scaling, and managing containerized applications."
          },
          { 
            name: "AWS", 
            icon: "fa-aws", 
            color: "#C8A2C8",
            description: "Cloud infrastructure design and deployment on Amazon Web Services.",
            children: [
              { name: "EC2", icon: "fa-server", color: "#9C8AA5", description: "Virtual server management in the AWS cloud." },
              { name: "Lambda", icon: "fa-code", color: "#5D3F6A", description: "Serverless compute for event-driven applications." },
              { name: "S3", icon: "fa-database", color: "#573D5A", description: "Object storage for static files and data." }
            ]
          },
          { 
            name: "Docker", 
            icon: "fa-docker", 
            color: "#7F5A83",
            description: "Containerization for consistent deployment across environments."
          }
        ]
      },
      {
        name: "LLM Integration",
        icon: "fa-robot",
        color: "#DDA0DD", // Plum
        description: "Building applications powered by large language models and AI.",
        children: [
          { 
            name: "GPT-4", 
            icon: "fa-brain", 
            color: "#D8BFD8",
            description: "Integrating OpenAI's GPT-4 for advanced natural language processing tasks."
          },
          { 
            name: "Gemini", 
            icon: "fa-brain", 
            color: "#BDA7BD",
            description: "Working with Google's Gemini models for multimodal AI applications."
          },
          { 
            name: "RAG", 
            icon: "fa-search", 
            color: "#A987B5",
            description: "Building Retrieval Augmented Generation systems for knowledge-intensive tasks.",
            children: [
              { name: "Vector Databases", icon: "fa-database", color: "#9B7EAA", description: "Using embedding databases like ChromaDB for semantic search." },
              { name: "Prompt Engineering", icon: "fa-edit", color: "#9683EC", description: "Designing effective prompts for optimal LLM performance." },
              { name: "Fine-tuning", icon: "fa-cogs", color: "#7152A1", description: "Specializing foundation models for domain-specific tasks." }
            ]
          },
          { 
            name: "Langchain", 
            icon: "fa-link", 
            color: "#CBA0FF",
            description: "Building complex AI applications using Langchain framework."
          }
        ]
      },
      {
        name: "Data Analysis",
        icon: "fa-chart-bar",
        color: "#E6E6FA", // Lavender
        description: "Data processing, analysis, and visualization techniques.",
        children: [
          { 
            name: "NumPy", 
            icon: "fa-table", 
            color: "#D8BFD8",
            description: "Scientific computing with Python for numerical operations."
          },
          { 
            name: "Pandas", 
            icon: "fa-table", 
            color: "#CCCCFF",
            description: "Data manipulation and analysis using DataFrame structures."
          },
          { 
            name: "Data Visualization", 
            icon: "fa-chart-line", 
            color: "#CBC3E3",
            description: "Creating informative and interactive data visualizations.",
            children: [
              { name: "Matplotlib", icon: "fa-chart-pie", color: "#A89CBD", description: "Static, animated, and interactive visualizations in Python." },
              { name: "D3.js", icon: "fa-chart-bar", color: "#B98FD9", description: "Building custom interactive data visualizations for the web." }
            ]
          }
        ]
      },
      {
        name: "Web Development",
        icon: "fa-globe",
        color: "#D8BFD8", // Thistle
        description: "Full-stack web development with modern technologies.",
        children: [
          { 
            name: "React", 
            icon: "fa-react", 
            color: "#9F91CC",
            description: "Building interactive user interfaces with React's component-based architecture."
          },
          { 
            name: "CSS", 
            icon: "fa-css3", 
            color: "#8675A9",
            description: "Advanced styling with CSS3, animations, and responsive design."
          },
          { 
            name: "JavaScript", 
            icon: "fa-js", 
            color: "#BDB5D5",
            description: "Modern ES6+ JavaScript for dynamic web applications."
          }
        ]
      }
    ]
  };

  // Set up SVG with D3
  const width = mindmapContainer.clientWidth;
  const height = mindmapContainer.clientHeight;
  const svg = d3.select(mindmapContainer)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Define force simulation for node layout
  const simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(80).strength(0.7))
    .force("charge", d3.forceManyBody().strength(-800))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(d => d.radius + 15));

  // Create a hierarchical layout
  const root = d3.hierarchy(data);
  let nodes = root.descendants();
  let links = root.links();

  // Assign unique IDs to nodes
  nodes.forEach((node, i) => {
    node.id = i;
    node.radius = node.depth === 0 ? 35 : 25;
    node.color = node.data.color || getColor(node.depth);
  });

  // Create main groups
  const linkGroup = svg.append("g").attr("class", "mindmap-links");
  const nodeGroup = svg.append("g").attr("class", "mindmap-nodes");

  // Create links
  const link = linkGroup.selectAll(".mindmap-link")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "mindmap-link")
    .attr("stroke", d => {
      // Gradient from parent to child color
      const gradientId = `gradient-${d.source.id}-${d.target.id}`;
      createLinkGradient(gradientId, d.source.color, d.target.color);
      return `url(#${gradientId})`;
    })
    .attr("stroke-opacity", 0.5);

  // Create link gradients
  function createLinkGradient(id, startColor, endColor) {
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", id)
      .attr("gradientUnits", "userSpaceOnUse");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", startColor);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", endColor);
  }

  // Create nodes
  const node = nodeGroup.selectAll(".mindmap-node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", d => `mindmap-node ${d.depth === 0 ? "main-node" : ""}`)
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  // Add circles to nodes
  node.append("circle")
    .attr("class", "mindmap-node-circle")
    .attr("r", d => d.radius)
    .attr("fill", d => d.color)
    .attr("stroke", "#fff")
    .attr("stroke-width", d => d.depth === 0 ? 2 : 1)
    .attr("stroke-opacity", 0.8)
    .style("filter", "drop-shadow(0px 3px 5px rgba(0,0,0,0.2))");

  // Add icons to nodes
  node.append("text")
    .attr("class", "mindmap-icon")
    .attr("fill", "#fff")
    .attr("font-family", "Font Awesome 5 Free")
    .attr("font-weight", 900)
    .text(d => getIconUnicode(d.data.icon || "fa-circle"));

  // Add labels
  node.append("text")
    .attr("class", "mindmap-label")
    .attr("dy", d => d.radius + 15)
    .text(d => d.data.name)
    .style("font-weight", d => d.depth === 0 ? 600 : 400)
    .style("font-size", d => d.depth === 0 ? "16px" : "14px")
    .attr("fill-opacity", 0.9);

  // Handle node interactions
  node.on("mouseover", function(event, d) {
    // Highlight node and connected links
    d3.select(this).select("circle")
      .transition()
      .duration(200)
      .attr("r", d.radius * 1.1);
    
    // Show tooltip with node info
    if (d.data.description) {
      tooltip.innerHTML = `<h4>${d.data.name}</h4><p>${d.data.description}</p>`;
      tooltip.style.opacity = 1;
      
      // Position tooltip near the mouse but avoid edges
      const x = Math.min(event.pageX - mindmapContainer.getBoundingClientRect().left, width - 260);
      const y = Math.min(event.pageY - mindmapContainer.getBoundingClientRect().top, height - 100);
      tooltip.style.left = `${x + 15}px`;
      tooltip.style.top = `${y - 20}px`;
    }
  })
  .on("mouseout", function(event, d) {
    // Restore node appearance
    d3.select(this).select("circle")
      .transition()
      .duration(200)
      .attr("r", d.radius);
    
    // Hide tooltip
    tooltip.style.opacity = 0;
  })
  .on("click", function(event, d) {
    // Expand/collapse node on click
    if (d.children) {
      // Node is expanded, collapse it
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      // Node is collapsed, expand it
      d.children = d._children;
      d._children = null;
    }
    
    // Don't perform action if leaf node
    if (!d._children && !d.children) return;
    
    // Update the data
    updateMindmap();
  });

  // Update mind map data and visualization
  function updateMindmap() {
    // Regenerate nodes and links from the hierarchy
    root = d3.hierarchy(data);
    nodes = root.descendants();
    links = root.links();
    
    // Reassign IDs and properties
    nodes.forEach((node, i) => {
      node.id = i;
      node.radius = node.depth === 0 ? 35 : 25;
      node.color = node.data.color || getColor(node.depth);
    });
    
    // Update links
    link = linkGroup.selectAll(".mindmap-link")
      .data(links, d => `${d.source.id}-${d.target.id}`);
      
    link.exit().remove();
    
    const linkEnter = link.enter()
      .append("path")
      .attr("class", "mindmap-link")
      .attr("stroke", d => {
        const gradientId = `gradient-${d.source.id}-${d.target.id}`;
        createLinkGradient(gradientId, d.source.color, d.target.color);
        return `url(#${gradientId})`;
      })
      .attr("stroke-opacity", 0.5);
    
    link = linkEnter.merge(link);
    
    // Update nodes
    node = nodeGroup.selectAll(".mindmap-node")
      .data(nodes, d => d.id);
      
    node.exit().remove();
    
    const nodeEnter = node.enter()
      .append("g")
      .attr("class", d => `mindmap-node ${d.depth === 0 ? "main-node" : ""}`)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
    nodeEnter.append("circle")
      .attr("class", "mindmap-node-circle")
      .attr("r", 0)
      .attr("fill", d => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", d => d.depth === 0 ? 2 : 1)
      .attr("stroke-opacity", 0.8)
      .style("filter", "drop-shadow(0px 3px 5px rgba(0,0,0,0.2))")
      .transition()
      .duration(500)
      .attr("r", d => d.radius);
      
    nodeEnter.append("text")
      .attr("class", "mindmap-icon")
      .attr("fill", "#fff")
      .attr("font-family", "Font Awesome 5 Free")
      .attr("font-weight", 900)
      .text(d => getIconUnicode(d.data.icon || "fa-circle"));
      
    nodeEnter.append("text")
      .attr("class", "mindmap-label")
      .attr("dy", d => d.radius + 15)
      .text(d => d.data.name)
      .style("font-weight", d => d.depth === 0 ? 600 : 400)
      .style("font-size", d => d.depth === 0 ? "16px" : "14px")
      .attr("fill-opacity", 0.9);
      
    node = nodeEnter.merge(node);
    
    // Add event listeners to new nodes
    nodeEnter
      .on("mouseover", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d.radius * 1.1);
        
        if (d.data.description) {
          tooltip.innerHTML = `<h4>${d.data.name}</h4><p>${d.data.description}</p>`;
          tooltip.style.opacity = 1;
          
          const x = Math.min(event.pageX - mindmapContainer.getBoundingClientRect().left, width - 260);
          const y = Math.min(event.pageY - mindmapContainer.getBoundingClientRect().top, height - 100);
          tooltip.style.left = `${x + 15}px`;
          tooltip.style.top = `${y - 20}px`;
        }
      })
      .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
          .transition()
          .duration(200)
          .attr("r", d.radius);
        
        tooltip.style.opacity = 0;
      })
      .on("click", function(event, d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else if (d._children) {
          d.children = d._children;
          d._children = null;
        }
        
        if (!d._children && !d.children) return;
        
        updateMindmap();
      });
      
    // Restart the simulation
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(0.3).restart();
  }

  // Simulation tick function
  simulation.nodes(nodes);
  simulation.force("link").links(links);
  
  simulation.on("tick", () => {
    // Update link paths
    link.attr("d", linkArc);
    
    // Update node positions
    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = Math.max(d.radius, Math.min(width - d.radius, event.x));
    d.fy = Math.max(d.radius, Math.min(height - d.radius, event.y));
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    
    // Keep root node fixed at center
    if (d.depth === 0) {
      d.fx = width / 2;
      d.fy = height / 2;
    } else {
      d.fx = null;
      d.fy = null;
    }
  }

  // Helper functions
  function linkArc(d) {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
  }
  
  function getColor(depth) {
    const colors = [
      "#8A2BE2", // Root - Purple
      "#9370DB", // Level 1 - Medium purple
      "#BA55D3", // Level 1 - Medium orchid
      "#7B68EE", // Level 1 - Medium slate blue
      "#6A5ACD", // Level 2 - Slate blue
      "#9683EC", // Level 2 - Purple blue
      "#CBC3E3"  // Level 2 - Lighter purple
    ];
    return colors[Math.min(depth, colors.length - 1)];
  }
  
  // Map Font Awesome icon names to Unicode
  function getIconUnicode(iconName) {
    const iconMap = {
      "fa-user": "\uf007",
      "fa-server": "\uf233",
      "fa-python": "\uf3e2",
      "fa-code": "\uf121",
      "fa-bolt": "\uf0e7",
      "fa-flask": "\uf0c3",
      "fa-node-js": "\uf3d3",
      "fa-database": "\uf1c0",
      "fa-network-wired": "\uf6ff",
      "fa-tasks": "\uf0ae",
      "fa-dharmachakra": "\uf655", // Kubernetes
      "fa-aws": "\uf375",
      "fa-server": "\uf233",
      "fa-docker": "\uf395",
      "fa-robot": "\uf544",
      "fa-brain": "\uf5dc",
      "fa-search": "\uf002",
      "fa-edit": "\uf044",
      "fa-cogs": "\uf085",
      "fa-link": "\uf0c1",
      "fa-chart-bar": "\uf080",
      "fa-table": "\uf0ce",
      "fa-chart-line": "\uf201",
      "fa-chart-pie": "\uf200",
      "fa-globe": "\uf0ac",
      "fa-react": "\uf41b",
      "fa-css3": "\uf13c",
      "fa-js": "\uf3b8",
      "fa-circle": "\uf111"
    };
    
    return iconMap[iconName] || "\uf111"; // Default to circle
  }

  // Fix root node position
  nodes[0].fx = width / 2;
  nodes[0].fy = height / 2;
  
  // Initial animation
  simulation.alpha(0.8).restart();

  // Handle window resize
  const resizeObserver = new ResizeObserver(entries => {
    const newWidth = mindmapContainer.clientWidth;
    const newHeight = mindmapContainer.clientHeight;
    
    svg.attr("width", newWidth).attr("height", newHeight);
    simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2)).alpha(0.3).restart();
    
    // Update root node position
    nodes[0].fx = newWidth / 2;
    nodes[0].fy = newHeight / 2;
  });
  
  resizeObserver.observe(mindmapContainer);
});