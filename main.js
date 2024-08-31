window.onload = function () {
    const canvas = document.getElementById("doomCanvas");
    const ctx = canvas.getContext("2d");

    let offsetX = 0;
    let offsetY = 0;
    let scale = 1;
    let prevMouseX = 0;
    let prevMouseY = 0;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let touching = false;
    // canvas.onmousedown = (e) => {
    //     [prevMouseX, prevMouseY] = eventToXY(e);
    //     canvas.onmousemove = (e) => {
    //         let [eX, eY] = eventToXY(e);
    //         offsetX -= (eX - prevMouseX) / scale;
    //         offsetY -= (eY - prevMouseY) / scale;
    //         prevMouseX = eX;
    //         prevMouseY = eY;
    //     };
    // };

    canvas.onmousedown = touch;
    document.body.addEventListener("mousemove", move);
    document.body.addEventListener("mouseup", released);
    // canvas.pointerdown = touch;
    // canvas.pointermove = move; Не работает
    // canvas.pointerup = released;
    function touch(e) {
        touching = true;
        let x = 0;
        let y = 0;
        if (e.type == "touchstart") {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        prevMouseX = x;
        prevMouseY = y;
    }
    function move(e) {
        if (!touching) return;
        let x = 0;
        let y = 0;
        if (e.type == "touchmove") {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        } else {
            x = e.clientX;
            y = e.clientY;
        }
        offsetX -= (x - prevMouseX) / scale;
        offsetY -= (y - prevMouseY) / scale;
        prevMouseX = x;
        prevMouseY = y;
        draw();
    }
    function released(e) {
        touching = false;
    }

    // canvas.ontouchstart = (e) => {
    //     [prevMouseX, prevMouseY] = eventToXY(e);
    //     canvas.ontouchmove = (e) => {
    //         let [eX, eY] = eventToXY(e);
    //         offsetX -= (eX - prevMouseX) / scale;
    //         offsetY -= (eY - prevMouseY) / scale;
    //         prevMouseX = eX;
    //         prevMouseY = eY;
    //     };
    // };

    canvas.onwheel = (e) => {
        e.preventDefault();
        const [prevWheelX, prevWheelY] = screenToWorld(e.x, e.y);
        scale -= (10 * scale) / e.deltaY;
        const [afterWheelX, afterWheelY] = screenToWorld(e.x, e.y);
        offsetX += prevWheelX - afterWheelX;
        offsetY += prevWheelY - afterWheelY;
        draw();
    };

    function draw() {
        //window.requestAnimationFrame(draw);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // for (let i = 0; i <= 100; i += 10) {
        //     let startX = 0,
        //         startY = i;
        //     let endX = 100,
        //         endY = i;
        //     [startX, startY] = worldToScreen(startX, startY);
        //     [endX, endY] = worldToScreen(endX, endY);
        //     ctx.beginPath();
        //     ctx.moveTo(startX, startY);
        //     ctx.lineTo(endX, endY);
        //     ctx.stroke();
        // }
        // for (let i = 0; i <= 100; i += 10) {
        //     let startX = i,
        //         startY = 0;
        //     let endX = i,
        //         endY = 100;
        //     [startX, startY] = worldToScreen(startX, startY);
        //     [endX, endY] = worldToScreen(endX, endY);
        //     ctx.beginPath();
        //     ctx.moveTo(startX, startY);
        //     ctx.lineTo(endX, endY);
        //     ctx.stroke();
        // }
        for (let i = 0; i < render.links.length; i++) {
            RenderLine(render.links[i]);
        }
        for (let i = 0; i < render.nodes.length; i++) {
            RenderNode(render.nodes[i]);
        }
        function RenderLine(line) {
            let startX = line.sourceX;
            let startY = line.sourceY;
            let endX = line.targetX;
            let endY = line.targetY;
            [startX, startY] = worldToScreen(startX, startY);
            [endX, endY] = worldToScreen(endX, endY);
            ctx.strokeStyle = "#000000";
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        function RenderNode(node) {
            let x = node.X - nodeSizeX / 2;
            let y = node.Y - nodeSizeY / 2;
            [x, y] = worldToScreen(x, y);
            let textX = node.X;
            let textY = node.Y;
            ctx.setLineDash([]);
            [textX, textY] = worldToScreen(textX, textY);
            switch (node.type) {
                case "mainline":
                    ctx.fillStyle = "#FFE6CC";
                    ctx.strokeStyle = "#D79B00";
                    break;
                case "official":
                    ctx.fillStyle = "#FFF2CC";
                    ctx.strokeStyle = "#D6B656";
                    break;
                case "unrelated":
                    ctx.fillStyle = "#FFFFFF";
                    ctx.setLineDash([4, 2]);
                    ctx.strokeStyle = "#000000";
            }
            ctx.fillRect(x, y, nodeSizeX * scale, nodeSizeY * scale);
            ctx.strokeRect(x, y, nodeSizeX * scale, nodeSizeY * scale);
            ctx.textBaseline = "middle";
            const fontSize = 30 * scale;
            ctx.font = `${fontSize}px sans-serif`;
            ctx.fillStyle = "#000000";
            ctx.textAlign = "center";
            wrapText(ctx, node.name, textX, textY, nodeSizeX * scale, fontSize);
            //ctx.fillText(node.name, textX, textY);
        }
        function wrapText(context, text, x, y, maxWidth, lineHeight) {
            var words = text.split(" ");
            let textRender = [];
            var line = "";
            for (var n = 0; n < words.length; n++) {
                var testLine = line + words[n] + " ";
                var metrics = context.measureText(testLine);
                var testWidth = metrics.width;
                if (testWidth > maxWidth && n > 0) {
                    //context.fillText(line, x, y);
                    textRender.push({ line, x, y });
                    line = words[n] + " ";
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            textRender.push({ line, x, y });
            let moveTextUp =
                (textRender.length * lineHeight) / 2 - lineHeight / 2;
            for (let i = 0; i < textRender.length; i++) {
                let row = textRender[i];
                context.fillText(row.line, row.x, row.y - moveTextUp);
            }
            //context.fillText(line, x, y);
        }
    }
    draw();

    function worldToScreen(x, y) {
        return [(x - offsetX) * scale, (y - offsetY) * scale];
    }

    function screenToWorld(x, y) {
        return [x / scale + offsetX, y / scale + offsetY];
    }
};
function resetCanvasSize() {
    const canvas = document.getElementById("doomCanvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    draw();
}
window.onresize = resetCanvasSize;

let doomData = [
    {
        id: "doomv1.0",
        name: "Doom v1.0",
        type: "mainline",
        children: ["doomv1.1"],
    },
    {
        id: "doomv1.1",
        name: "Doom v1.1",
        type: "mainline",
        children: ["doomv1.2"],
    },
    {
        id: "doomv1.2",
        name: "Doom v1.2",
        type: "mainline",
        children: ["heretic", "doomv1.3", "windoom", "jaguardoom"],
    },
    {
        id: "doomv1.3",
        name: "Doom v1.3",
        type: "mainline",
        children: ["doomv1.4"],
    },
    {
        id: "doomv1.4",
        name: "Doom v1.4",
        type: "mainline",
        children: ["doomv1.5"],
    },
    {
        id: "doomv1.5",
        name: "Doom v1.5",
        type: "mainline",
        children: ["cgidoom", "doomv1.666"],
    },
    {
        id: "cgidoom",
        name: "CGI Doom",
        type: "official",
        children: ["qnxdoom"],
    },
    {
        id: "qnxdoom",
        name: "QNX Doom",
        type: "official",
    },
    {
        id: "doomv1.666",
        name: "Doom v1.666",
        type: "mainline",
        children: ["doomv1.7", "sonyplaystation"],
    },
    {
        id: "doomv1.7",
        name: "Doom v1.7",
        type: "mainline",
        children: ["doomv1.7a"],
    },
    {
        id: "doomv1.7a",
        name: "Doom v1.7a",
        type: "mainline",
        children: ["doomv1.8"],
    },
    {
        id: "doomv1.8",
        name: "Doom v1.8",
        type: "mainline",
        children: ["doomv1.9"],
    },
    {
        id: "doomv1.9",
        name: "Doom v1.9",
        type: "mainline",
        children: ["ultimatedoom"],
    },
    {
        id: "ultimatedoom",
        name: "Ultimate Doom",
        type: "mainline",
        children: ["finaldoom"],
    },
    {
        id: "finaldoom",
        name: "Final Doom",
        type: "mainline",
        children: ["finaldoomanthology"],
    },
    {
        id: "sonyplaystation",
        name: "Sony PlayStation",
        type: "official",
    },
    {
        id: "finaldoomanthology",
        name: "Final Doom (id Anthology)",
        type: "mainline",
        children: ["linuxdoom"],
    },
    {
        id: "linuxdoom",
        name: "Linux Doom 1.10",
        type: "mainline",
        children: ["doomforxbox"],
    },
    {
        id: "doomforxbox",
        name: "Doom and Doom II for Xbox",
        type: "mainline",
        children: ["doomforxbox360"],
    },
    {
        id: "doomforxbox360",
        name: "Doom and Doom II for Xbox 360",
        type: "mainline",
        children: ["doomclassic"],
    },
    {
        id: "doomclassic",
        name: "Doom Classic",
        type: "mainline",
        parents: ["idtech4"],
        children: [],
    },
    {
        id: "idtech4",
        name: "id Tech 4",
        type: "unrelated",
    },
    {
        id: "heretic",
        name: "Heretic",
        type: "official",
    },
    {
        id: "windoom",
        name: "WinDoom (Microsoft)",
        type: "official",
    },
    {
        id: "jaguardoom",
        name: "Jaguar Doom",
        type: "official",
        children: [
            "doomfor3do",
            "sonyplaystation",
            "doomforsega32x",
            "doomforgba",
        ],
    },
    {
        id: "doomfor3do",
        name: "Doom for 3DO",
        type: "official",
    },
    {
        id: "doomforsega32x",
        name: "Doom for Sega 32X",
        type: "official",
    },
    {
        id: "doomforgba",
        name: "Doom for Game Boy Advance",
        type: "official",
    },
];

const paddingBetweenNodesX = 50;
const paddingBetweenNodesY = 100;
const nodeSizeX = 200;
const nodeSizeY = 100;

const render = renderData(doomData);
console.log(render);

function renderData(data) {
    let result = {
        nodes: [],
        links: [],
    };

    data.forEach((element) => {
        if (!element.children) {
            element.children = [];
        }
        if (!element.parents) {
            element.parents = [];
        }
    });
    data.forEach((element) => {
        if (element.children.length > 0) {
            element.children.forEach((child) => {
                let x = data.find((x) => x.id == child);
                if (x) {
                    if (!x.parents.includes(element.id)) {
                        x.parents.push(element.id);
                    }
                }
            });
        }
        if (element.parents.length > 0) {
            element.parents.forEach((parent) => {
                let y = data.find((x) => x.id == parent);
                if (y) {
                    if (!y.children.includes(element.id)) {
                        y.children.push(element.id);
                    }
                }
            });
        }
    });

    calcNodeSizes(data[0], null);
    calcNodePosition(data[0], null);

    for (let i = 0; i < data.length; i++) {
        let node = data[i];
        result.nodes.push(node);

        if (node.children && node.children.length > 0) {
            for (let j = 0; j < node.children.length; j++) {
                let child = data.find((x) => x.id == node.children[j]);
                if (!child) {
                    continue;
                }
                link = {
                    source: node.id,
                    sourceX: node.X,
                    sourceY: node.Y,
                    target: child.id,
                    targetX: child.X,
                    targetY: child.Y,
                };
                if (!result.links.includes(link)) {
                    result.links.push(link);
                }
            }
        }
    }

    function calcNodeSizes(node, parent) {
        let cell = node;
        cell.sizeY = nodeSizeY + paddingBetweenNodesY;

        let maxChildrentCount = 1;

        if (cell.children.length > 0) {
            maxChildrentCount = cell.children.length;
            let children = data.filter(
                (x) => cell.children.includes(x.id) && !x.sizeY
            );
            let size = 0;
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                size += calcNodeSizes(child, cell);
            }
            if (size > maxChildrentCount) {
                maxChildrentCount = size;
            }
        }
        cell.sizeX = maxChildrentCount * (nodeSizeX + paddingBetweenNodesX);

        let unrelatedNodes = data.filter(
            (x) =>
                cell.parents.includes(x.id) && x.parents.length == 0 && !x.sizeX
        );
        if (unrelatedNodes.length > 0) {
            if (maxChildrentCount < unrelatedNodes.length + 1) {
                maxChildrentCount = unrelatedNodes.length + 1;
            }
        }

        return maxChildrentCount;
    }
    function calcNodePosition(node, parent, cellOffsetX = 0) {
        let cell = node;

        if (!parent) {
            cell.Y = 0;
            cell.X = 0;
        } else {
            cell.Y = parent.Y + (paddingBetweenNodesY + nodeSizeY);
            cell.X = parent.X + cellOffsetX + cell.sizeX / 2 - parent.sizeX / 2;
        }
        if (cell.children.length > 0) {
            //let children = data.filter((x) => cell.children.includes(x.id));
            let childrenOffset = 0;
            for (let i = 0; i < cell.children.length; i++) {
                let child = data.find((x) => x.id == cell.children[i]);
                childrenOffset = calcNodePosition(child, cell, childrenOffset);
            }
        }
        let unrelatedNodes = [];
        for (let i = 0; i < cell.children.length; i++) {
            let child = data.find((x) => x.id == cell.children[i]);
            unrelatedNodes.push(
                ...data.filter(
                    (x) =>
                        child.parents.includes(x.id) &&
                        x.parents.length == 0 &&
                        !x.sizeX
                )
            );
        }
        cell.unrelatedNodes = unrelatedNodes;
        if (unrelatedNodes.length > 0) {
            cell.X -=
                (unrelatedNodes.length - 0.5) *
                (nodeSizeX + paddingBetweenNodesX);
            let unrelatedNodeOffset = cell.X;
            for (let i = 0; i < unrelatedNodes.length; i++) {
                let un = unrelatedNodes[i];
                unrelatedNodeOffset += nodeSizeX + paddingBetweenNodesX;
                un.Y = cell.Y;
                un.X = unrelatedNodeOffset;
            }
        }
        return cellOffsetX + cell.sizeX;
    }

    return result;
}
