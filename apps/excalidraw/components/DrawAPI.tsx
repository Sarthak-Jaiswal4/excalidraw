import { GetMessages, updatesnap } from "@/actions";

type Draw = {
    id: number
    type: "rect"
    startx: number
    starty: number
    width: number
    height: number
} | {
    id: number
    type: "circle",
    centerx: number
    centery: number
    radiusx: number
    radiusy: number
} | {
    id: number
    type: "line",
    startx: number,
    starty: number,
    endx: number,
    endy: number
} | {
    id: number
    type: "pencil",
    points: { x: number, y: number }[]
};

export default async function DrawApi(canvas: HTMLCanvasElement, socket: WebSocket, roomid: string) {
    const ctx = canvas?.getContext("2d")
    let drawing: Draw[] = await GetMessages(roomid)
    let id=1;
    if (!ctx) return

    socket.onmessage = (e) => {
        const message = JSON.parse(e.data)
        if (message.type === "chat") {
            const parsedData = JSON.parse(message.message)
            drawing.push(parsedData)
            clearRect(drawing, ctx, canvas)
        } else if (message.type === "delete") {
            const parsedData = JSON.parse(message.message)
            drawing = drawing.filter((shape) => shape.id !== parsedData.id)
            clearRect(drawing, ctx, canvas)
        } else if (message.type === "move") {
            const parsedData = JSON.parse(message.message)
            drawing = drawing.map((shape) => { if(shape.id === parsedData?.id) return parsedData; return shape })
            clearRect(drawing, ctx, canvas)
        }
    }

    let coord = { x: 0, y: 0 };

    function getPosition(e: any) {
		// Convert to world coordinates considering current pan/zoom
		coord.x = (e.offsetX - panOffsetX)/scale;
		coord.y = (e.offsetY - panOffsetY)/scale;
    }

    clearRect(drawing, ctx, canvas)
    let selectedShape:Draw | null
    let dragging=false
    let scale = 1
    let startx = 0
    let starty = 0
    let draw = false
    let panning = false
    let deleting=false
    let pencilPoints: { x: number, y: number }[] = [];
	let dragStartMouseX = 0
	let dragStartMouseY = 0
	let dragStartShapeX = 0
	let dragStartShapeY = 0 
	let panOffsetX = 0
	let panOffsetY = 0 
	let panStartMouseX = 0
	let panStartMouseY = 0

    canvas?.addEventListener("mousedown", function (e) {
        e.preventDefault()
		startx = (e.offsetX - panOffsetX)/scale
		starty = (e.offsetY - panOffsetY)/scale
        console.log(startx,starty,e.offsetX,e.offsetY)
        getPosition(e);
        // @ts-ignore
        const tool = window.SelectedTool
        if (tool != 'pan' && tool != 'delete') {
            draw = true
            if (tool === 'pencil') {
                pencilPoints = [{ x: coord.x, y: coord.y }];
			}else if(tool==='move'){
                socket.send(JSON.stringify({
                    type:"corsor_move",
                    posx:startx,
                    posy:starty,
                    roomId:1
                }))
				dragging=true
			    const ss:Draw | null = hitShape(startx, starty, drawing)
				selectedShape = ss
				if (!ss) {
					dragging = false
                    selectedShape=null
				} else {
					dragStartMouseX = startx
					dragStartMouseY = starty
					if (selectedShape && selectedShape.type === 'rect') {
						dragStartShapeX = selectedShape.startx
						dragStartShapeY = selectedShape.starty
					}
				}
				console.log(selectedShape)
            }
        } else if(tool==='delete'){
            deleting=true
		} else {
			panning = true
			panStartMouseX = e.offsetX
			panStartMouseY = e.offsetY
        }
    })

    canvas?.addEventListener("mouseup", function (e) {
        // @ts-ignore
        const tool = window.SelectedTool

		const width = ((e.offsetX - panOffsetX)/scale) - startx
		const height = ((e.offsetY - panOffsetY)/scale) - starty
        draw = false
        dragging=false
        
        if (panning) {
            const dx = (e.offsetX - panStartMouseX)
            const dy = (e.offsetY - panStartMouseY)
            panOffsetX += dx
            panOffsetY += dy
        }
        panning = false
        ctx.setTransform(scale, 0, 0, scale, panOffsetX, panOffsetY)
        clearRect(drawing, ctx, canvas)
        if (tool == "rectangle") {
            const shape: Draw = {
                id: id++,
                type: "rect",
                startx,
                starty,
                width,
                height
            }

            drawing.push(shape)
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'circle') {
            const radiusx = Math.abs(width / 2)
            const radiusy = Math.abs(height / 2)
            const centerx = startx + radiusx
            const centery = starty + radiusy
            const shape: Draw = {
                id: id++,
                type: "circle",
                centerx,
                centery,
                radiusx,
                radiusy
            }
            drawing.push(shape)
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'line') {
			const endx = (e.offsetX - panOffsetX)/scale
			const endy = (e.offsetY - panOffsetY)/scale
            const shape: Draw = {
                id: id++,
                type: "line",
                startx,
                starty,
                endx,
                endy
            }
            drawing.push(shape)
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'pencil') {
            if (pencilPoints.length > 1) {
                const shape: Draw = {
                    id: id++,
                    type: "pencil",
                    points: [...pencilPoints]
                };
                drawing.push(shape);
                socket.send(JSON.stringify({
                    message: JSON.stringify(shape), room: Number(roomid), type: "chat"
                }))
            }
            pencilPoints = [];
        } else if (tool == 'move'){
            if(selectedShape){
                console.log(selectedShape)
                socket.send(JSON.stringify({
                    type:"move",
                    message:selectedShape,
                    room:1
                }))
            }
            dragging=false
            selectedShape=null
        } else if(tool == 'delete'){
            deleting=false
            selectedShape=null
        }
    })

    canvas?.addEventListener("mousemove", function (e) {
        // @ts-ignore
        const tool = window.SelectedTool
        if (draw) {
            clearRect(drawing, ctx, canvas)
			const width = ((e.offsetX - panOffsetX)/scale - startx)
			const height = ((e.offsetY - panOffsetY)/scale - starty)
            ctx.strokeStyle = "white";
            if (tool == "rectangle") {
                ctx.strokeRect(startx, starty, width, height);
            } else if (tool == 'circle') {
                const radiusx = Math.abs(width / 2)
                const radiusy = Math.abs(height / 2)
                const centerx = startx + radiusx
                const centery = starty + radiusy
                ctx.beginPath();
                ctx.ellipse(centerx, centery, radiusx, radiusy, 0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.closePath()
            } else if (tool == 'line') {
                ctx.beginPath();
                ctx.moveTo(startx, starty);
				ctx.lineTo((e.offsetX - panOffsetX)/scale, (e.offsetY - panOffsetY)/scale);
                ctx.stroke();
            } else if (tool == 'pencil') {
                getPosition(e);
                pencilPoints.push({ x: coord.x, y: coord.y });
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
                ctx.strokeStyle = "white";
                if (pencilPoints.length > 1) {
                    ctx.moveTo(pencilPoints[0].x, pencilPoints[0].y);
                    for (let i = 1; i < pencilPoints.length; i++) {
                        ctx.lineTo(pencilPoints[i].x, pencilPoints[i].y);
                    }
                    ctx.stroke();
                }
			} else if (tool == 'move' && selectedShape && selectedShape.type=='rect' && dragging) {
                socket.send(JSON.stringify({
                    type:"corsor_move",
                    posx:e.offsetX,
                    posy:e.offsetY,
                    roomId:1
                }))
				const newX = dragStartShapeX + (((e.offsetX - panOffsetX)/scale) - dragStartMouseX)
				const newY = dragStartShapeY + (((e.offsetY - panOffsetY)/scale) - dragStartMouseY)
				selectedShape.startx = newX
				selectedShape.starty = newY
				drawing = drawing.map((shape:Draw) => { if (shape.id === selectedShape?.id) return selectedShape; return shape })
				clearRect(drawing, ctx, canvas)
			} 
        } else if(tool=='delete' && deleting){
            const ss:Draw | null = hitShape((e.offsetX-panOffsetX)/scale, (e.offsetY-panOffsetY)/scale, drawing)
            selectedShape = ss
            if(selectedShape!==null){
                socket.send(JSON.stringify({
                    message: JSON.stringify(selectedShape), room: Number(roomid), type: "delete"
                }))
            }
            console.log(selectedShape)
            drawing=drawing.filter( shape => shape.id!==selectedShape?.id)
            clearRect(drawing, ctx, canvas)
		} else if (panning) {
			const dx = (e.offsetX - panStartMouseX)
			const dy = (e.offsetY - panStartMouseY)
			const tx = panOffsetX + dx
			const ty = panOffsetY + dy
			ctx.setTransform(scale, 0, 0, scale, tx, ty)
			clearRect(drawing, ctx, canvas)
        }
    })

    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();
        let zoomFactor = 1.05;
        if (e.deltaY < 0) {
            scale *= zoomFactor;
        } else {
            scale /= zoomFactor;
        }
        scale = Math.max(1, Math.min(5, scale));
        console.log(scale, e.deltaY < 0 ? "zoom in" : "zoom out");
		ctx.setTransform(scale, 0, 0, scale, panOffsetX, panOffsetY);
        clearRect(drawing, ctx, canvas);
    }, { passive: false });

    setTimeout(async() => {
        const snapURL=canvas.toDataURL('image/png')
        const update=await updatesnap(snapURL,Number(roomid))
        console.log(update)
    }, 10000);
}
function hitShape(x:number, y:number, drawing:Draw[]): Draw | null {
	for (const shape of drawing) {
		if (shape.type === 'rect') {
			const minX = Math.min(shape.startx, shape.startx + shape.width)
			const maxX = Math.max(shape.startx, shape.startx + shape.width)
			const minY = Math.min(shape.starty, shape.starty + shape.height)
			const maxY = Math.max(shape.starty, shape.starty + shape.height)
			if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
				return shape
			}
		} else if (shape.type === 'circle') {
			const nx = (x - shape.centerx) / shape.radiusx
			const ny = (y - shape.centery) / shape.radiusy
			if (nx * nx + ny * ny <= 1) {
				return shape
			}
		}
		// Optionally add hit-tests for 'line' and 'pencil' types later
	}
	return null
}

function clearRect(drawing: Draw[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
	// Clear in device space to avoid artifacts at edges during pan/zoom
	ctx.save()
	ctx.setTransform(1, 0, 0, 1, 0, 0)
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = "rgba(0,0,0)"
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	ctx.restore()

    drawing.map(shape => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.startx, shape.starty, shape.width, shape.height);
        } else if (shape.type === "circle") {
            ctx.beginPath();
            ctx.ellipse(shape.centerx, shape.centery, shape.radiusx, shape.radiusy, 0, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (shape.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(shape.startx, shape.starty);
            ctx.lineTo(shape.endx, shape.endy);
            ctx.stroke();
        } else if (shape.type === 'pencil') {
            if (shape.points && shape.points.length > 1) {
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                for (let i = 1; i < shape.points.length; i++) {
                    ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                ctx.stroke();
            }
        }
    })
}