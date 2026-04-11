import { GetMessages, updatesnap } from "@/actions";
import { Shapes } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

type Draw = {
    id: string
    type: "rect"
    startx: number
    starty: number
    width: number
    height: number
    radius?: number
} | {
    id: string
    type: "circle",
    centerx: number
    centery: number
    radiusx: number
    radiusy: number
} | {
    id: string
    type: "line",
    startx: number,
    starty: number,
    endx: number,
    endy: number
} | {
    id: string
    type: "pencil",
    points: { x: number, y: number }[]
} | {
    id: string,
    type: "text",
    text: string
    font_size: number
    font_type: string
    startx: number
    starty: number
}

type Action =
    | { type: "add"; shape: Draw }
    | { type: "delete"; shape: Draw }
    | { type: "update"; prev: Draw; next: Draw }

export default async function DrawApi(canvas: HTMLCanvasElement, socket: WebSocket, roomid: string) {
    const ctx = canvas?.getContext("2d")
    let id = 1;
    if (!ctx) return
    let drawing: Draw[] = await GetMessages(roomid, ctx, canvas)
    console.log(drawing)

    let selectedShape: Draw | null
    let fakeSelectedShape: Draw | null = null
    let selectedShapeBorderId: string | null = null
    let dragging = false
    let scale = 1
    let startx = 0
    let starty = 0
    let draw = false
    let panning = false
    let deleting = false
    let texting = false
    let pencilPoints: { x: number, y: number }[] = [];
    let dragStartMouseX = 0
    let dragStartMouseY = 0
    let dragStartShapeX = 0
    let dragStartShapeY = 0
    let panOffsetX = 0
    let panOffsetY = 0
    let panStartMouseX = 0
    let panStartMouseY = 0
    let texts = ""
    let textID = 0;
    canvas.tabIndex = 0;
    let undoStack: Action[] = []
    let redoStack: Action[] = []
    let DragShot: Draw | null = null


    socket.onmessage = (e) => {
        const message = JSON.parse(e.data)
        if (message.type === "chat") {
            const parsedData = JSON.parse(message.message)
            drawing.push(parsedData)
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        } else if (message.type === "delete") {
            const parsedData = JSON.parse(message.message)
            drawing = drawing.filter((shape) => shape.id !== parsedData.id)
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        } else if (message.type === "move") {
            const parsedData = typeof message.message === "string" ? JSON.parse(message.message) : message.message;
            drawing = drawing.map((shape) => { if (shape.id === parsedData?.id) return parsedData; return shape })
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        }
    }

    let coord = { x: 0, y: 0 };

    function getPosition(e: any) {
        // Convert to world coordinates considering current pan/zoom
        coord.x = (e.offsetX - panOffsetX) / scale;
        coord.y = (e.offsetY - panOffsetY) / scale;
    }

    clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)


    canvas?.addEventListener("mousedown", function (e) {
        e.preventDefault()
        startx = (e.offsetX - panOffsetX) / scale
        starty = (e.offsetY - panOffsetY) / scale
        getPosition(e);
        texting = false;
        // @ts-ignore
        const tool = window.SelectedTool
        if (tool !== 'move') {
            if (fakeSelectedShape !== null) {
                fakeSelectedShape = null;
                clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, undefined);
            }
        }

        if (tool != 'pan' && tool != 'delete' && tool != 'text') {
            draw = true
            if (tool === 'pencil') {
                pencilPoints = [{ x: coord.x, y: coord.y }];
            } else if (tool === 'move') {
                socket.send(JSON.stringify({
                    type: "corsor_move",
                    posx: startx,
                    posy: starty,
                    roomId: Number(roomid)
                }))
                dragging = true
                const ss: Draw | null = hitShape(startx, starty, drawing)
                selectedShape = ss
                if (!ss) {
                    dragging = false
                    selectedShape = null
                    if (fakeSelectedShape !== null) {
                        fakeSelectedShape = null
                        clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, undefined);
                    }
                } else {
                    dragStartMouseX = startx
                    dragStartMouseY = starty
                    if (selectedShape && selectedShape.type === 'rect') {
                        dragStartShapeX = selectedShape.startx
                        dragStartShapeY = selectedShape.starty
                    } else if (selectedShape && selectedShape.type === 'circle') {
                        dragStartShapeX = selectedShape.centerx
                        dragStartShapeY = selectedShape.centery
                    }
                    if (selectedShape) {
                        const selection = dashSelection(drawing, selectedShape, ctx, selectedShapeBorderId);
                        if (selection) {
                            selectedShapeBorderId = selection.id;
                            fakeSelectedShape = selection.shape;
                        }
                    }
                }
                DragShot = selectedShape ? JSON.parse(JSON.stringify(selectedShape)) : null
                console.log(selectedShape)
            }
        } else if (tool === 'delete') {
            deleting = true
        } else if (tool === 'text') {
            texts = ""
            texting = true
            textID++;
            canvas.focus();
        } else {
            panning = true
            panStartMouseX = e.offsetX
            panStartMouseY = e.offsetY
        }
    })

    canvas?.addEventListener("mouseup", function (e) {
        // @ts-ignore
        const tool = window.SelectedTool

        const width = ((e.offsetX - panOffsetX) / scale) - startx
        const height = ((e.offsetY - panOffsetY) / scale) - starty
        draw = false
        dragging = false

        if (panning) {
            const dx = (e.offsetX - panStartMouseX)
            const dy = (e.offsetY - panStartMouseY)
            panOffsetX += dx
            panOffsetY += dy
        }
        panning = false
        ctx.setTransform(scale, 0, 0, scale, panOffsetX, panOffsetY)
        clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        if (tool == "rectangle") {
            const shape: Draw = {
                id: uuidv4(),
                type: "rect",
                startx,
                starty,
                width,
                height,
                radius: 40
            }

            drawing.push(shape)
            undoStack.push({ type: "add", shape })
            redoStack = []
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'circle') {
            const radiusx = Math.abs(width / 2)
            const radiusy = Math.abs(height / 2)
            const centerx = startx + radiusx
            const centery = starty + radiusy
            const shape: Draw = {
                id: uuidv4(),
                type: "circle",
                centerx,
                centery,
                radiusx,
                radiusy
            }
            drawing.push(shape)
            undoStack.push({ type: "add", shape })
            redoStack = []
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'line') {
            const endx = (e.offsetX - panOffsetX) / scale
            const endy = (e.offsetY - panOffsetY) / scale
            const shape: Draw = {
                id: uuidv4(),
                type: "line",
                startx,
                starty,
                endx,
                endy
            }
            drawing.push(shape)
            undoStack.push({ type: "add", shape })
            redoStack = []
            socket.send(JSON.stringify({
                message: JSON.stringify(shape), room: Number(roomid), type: "chat"
            }))
        } else if (tool == 'pencil') {
            if (pencilPoints.length > 1) {
                const shape: Draw = {
                    id: uuidv4(),
                    type: "pencil",
                    points: [...pencilPoints]
                };
                drawing.push(shape);
                undoStack.push({ type: "add", shape })
                redoStack = []
                socket.send(JSON.stringify({
                    message: JSON.stringify(shape), room: Number(roomid), type: "chat"
                }))
            }
            pencilPoints = [];
        } else if (tool == 'move') {
            drawing = drawing.filter((shape) => shape.id !== selectedShapeBorderId)
            if (selectedShape) {
                socket.send(JSON.stringify({
                    type: "move",
                    message: selectedShape,
                    room: Number(roomid)
                }))
            }
            if (DragShot && selectedShape) {
                console.log(DragShot, selectedShape)
                undoStack.push({ type: "update", prev: DragShot, next: JSON.parse(JSON.stringify(selectedShape)) })
                redoStack = []
            }
            dragging = false
        } else if (tool == 'delete') {
            deleting = false
            selectedShape = null
        }
    })

    canvas?.addEventListener("mousemove", function (e) {
        // @ts-ignore
        const tool = window.SelectedTool
        if (draw) {
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
            const width = ((e.offsetX - panOffsetX) / scale - startx)
            const height = ((e.offsetY - panOffsetY) / scale - starty)
            ctx.strokeStyle = "white";
            if (tool == "rectangle") {
                ctx.beginPath();
                ctx.roundRect(startx, starty, width, height, [40]);
                ctx.stroke();
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
                ctx.lineTo((e.offsetX - panOffsetX) / scale, (e.offsetY - panOffsetY) / scale);
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
            } else if (tool == 'move' && selectedShape && dragging && fakeSelectedShape) {
                throttledCursorSend(e.offsetX, e.offsetY, socket, roomid)
                const newX = dragStartShapeX + (((e.offsetX - panOffsetX) / scale) - dragStartMouseX)
                const newY = dragStartShapeY + (((e.offsetY - panOffsetY) / scale) - dragStartMouseY)
                if (selectedShape.type == 'circle') {
                    selectedShape.centerx = newX
                    selectedShape.centery = newY
                } else if (selectedShape.type == 'rect' && fakeSelectedShape?.type == 'rect') {
                    selectedShape.startx = newX
                    selectedShape.starty = newY
                    fakeSelectedShape.startx = newX - 10
                    fakeSelectedShape.starty = newY - 10
                }
                drawing = drawing.map((shape: Draw) => { if (shape.id === selectedShape?.id) return selectedShape; return shape })
                clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape)
            }
        } else if (tool == 'delete' && deleting) {
            const ss: Draw | null = hitShape((e.offsetX - panOffsetX) / scale, (e.offsetY - panOffsetY) / scale, drawing)
            selectedShape = ss
            if (selectedShape !== null) {
                undoStack.push({ type: "delete", shape: selectedShape })
                redoStack = []
                socket.send(JSON.stringify({
                    message: JSON.stringify(selectedShape), room: Number(roomid), type: "delete"
                }))
            }
            console.log(selectedShape)
            drawing = drawing.filter(shape => shape.id !== selectedShape?.id)
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        } else if (panning) {
            const dx = (e.offsetX - panStartMouseX)
            const dy = (e.offsetY - panStartMouseY)
            const tx = panOffsetX + dx
            const ty = panOffsetY + dy
            ctx.setTransform(scale, 0, 0, scale, tx, ty)
            clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        }
    })

    canvas.addEventListener('keydown', function (e) {
        // drawing = drawing.filter(e => e.id !== textID);
        // @ts-ignore
        const tool = window.SelectedTool

        texts += String(e.key)
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`${texts}`, startx, starty);
        const text: Draw = {
            id: uuidv4(),
            type: "text",
            text: texts,
            font_size: 30,
            font_type: "Arial",
            startx: startx,
            starty: starty
        }
        drawing.push(text)
        undoStack.push({ type: "add", shape: text })
        redoStack = []
        clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
        socket.send(JSON.stringify({
            message: JSON.stringify(text), room: Number(roomid), type: "chat"
        }))
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
        clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined);
    }, { passive: false });

    setTimeout(async () => {
        const snapURL = canvas.toDataURL('image/png')
        const update = await updatesnap(snapURL, Number(roomid))
        console.log(update)
    }, 10000);

    const UndoOperation = () => {
        if (undoStack.length > 0) {
            const action = undoStack.pop()
            if (action) {
                redoStack.push(action)
                if (action.type === "add") {
                    drawing = drawing.filter(e => e.id !== action.shape.id)
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.shape), room: Number(roomid), type: "delete"
                    }))
                } else if (action.type === "delete") {
                    drawing.push(action.shape)
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.shape), room: Number(roomid), type: "chat"
                    }))
                } else if (action.type === "update") {
                    drawing = drawing.map(e => e.id === action.prev.id ? JSON.parse(JSON.stringify(action.prev)) : e)
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.prev), room: Number(roomid), type: "move"
                    }))
                }
                clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined)
                fakeSelectedShape = null
                selectedShape = null
            }
        }
    };

    const RedoOperation = () => {
        if (redoStack.length > 0) {
            const action = redoStack.pop();
            if (action) {
                undoStack.push(action);
                if (action.type === "add") {
                    drawing.push(action.shape);
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.shape), room: Number(roomid), type: "chat"
                    }))
                } else if (action.type === "delete") {
                    drawing = drawing.filter(e => e.id !== action.shape.id);
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.shape), room: Number(roomid), type: "delete"
                    }))
                } else if (action.type === "update") {
                    drawing = drawing.map(e => e.id === action.next.id ? JSON.parse(JSON.stringify(action.next)) : e);
                    socket.send(JSON.stringify({
                        message: JSON.stringify(action.next), room: Number(roomid), type: "move"
                    }))
                }
                clearRect(drawing, ctx, canvas, scale, panOffsetX, panOffsetY, fakeSelectedShape || undefined);
            }
        }
    };

    (window as any).UndoOperation = UndoOperation;
    (window as any).RedoOperation = RedoOperation;
}

function hitShape(x: number, y: number, drawing: Draw[]): Draw | null {
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
        } else if (shape.type === 'line') {
            const { startx, starty, endx, endy } = shape;
            const dx = endx - startx;
            const dy = endy - starty;
            const slope = dy / dx;
            const lhs = starty - y;
            const rhs = slope * (startx - x);
            const tolerance = 0.8
            console.log("Line selected")
            if (Math.abs(lhs - rhs) < tolerance) {
                return shape
            }
            // const lengthSq = dx * dx + dy * dy;
            // let t = ((x - startx) * dx + (y - starty) * dy) / lengthSq;
            // t = Math.max(0, Math.min(1, t)); // Clamp t to [0,1] to stay within segment
            // const closestX = startx + t * dx;
            // const closestY = starty + t * dy;
            // const distSq = (x - closestX) ** 2 + (y - closestY) ** 2;
            // const threshold = 8; // px tolerance for selecting a line
            // if (distSq <= threshold * threshold) {
            // 	return shape;
            // }
        }
    }
    return null
}

function clearRect(drawing: Draw[], ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, scale: number, panOffsetX: number, panOffsetY: number, fakeshape?: Draw) {
    // Clear in device space to avoid artifacts at edges during pan/zoom
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "rgba(0,0,0)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.setTransform(scale, 0, 0, scale, panOffsetX, panOffsetY)
    ctx.strokeStyle = "white"

    const padding = 10;
    if (fakeshape && fakeshape.type === "rect") {
        ctx.save();

        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";

        ctx.strokeRect(
            fakeshape.startx - padding,
            fakeshape.starty - padding,
            fakeshape.width + padding * 2,
            fakeshape.height + padding * 2
        );

        ctx.restore();
    } else if (fakeshape && fakeshape.type === 'circle') {
        ctx.save();

        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";

        ctx.beginPath();
        ctx.ellipse(
            fakeshape.centerx,
            fakeshape.centery,
            fakeshape.radiusx + padding,
            fakeshape.radiusy + padding,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.restore();
    } else if (fakeshape && fakeshape.type === 'line') {
        ctx.save();

        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "white";

        ctx.beginPath();
        ctx.moveTo(fakeshape.startx, fakeshape.starty);
        ctx.lineTo(fakeshape.endx, fakeshape.endy);
        ctx.stroke();

        ctx.restore();
    }

    drawing.map(shape => {
        if (shape.type === "rect") {
            if (shape.radius) {
                ctx.beginPath();
                ctx.roundRect(shape.startx, shape.starty, shape.width, shape.height, [40]);
                ctx.stroke();
            } else {
                ctx.strokeRect(shape.startx, shape.starty, shape.width, shape.height);
            }
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
        } else if (shape.type === 'text') {
            ctx.font = "30px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(`${shape.text}`, shape.startx, shape.starty);
        }
    })
}

function throttle(fn: Function, delay: number) {
    let lastCall = 0;

    return (...args: any[]) => {
        const now = Date.now();

        if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
        }
    };
}

const throttledCursorSend = throttle((x: number, y: number, socket: WebSocket, roomid: string) => {

    socket.send(JSON.stringify({
        type: "corsor_move",
        posx: x,
        posy: y,
        roomId: Number(roomid)
    }));

}, 300);

const dashSelection = (shapes: Draw[], selectedShape: Draw, ctx: CanvasRenderingContext2D, selectedShapeBorderId: string | null) => {
    const padding = 10;

    const ID = uuidv4();
    ctx.save();

    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    if (selectedShape.type === "rect") {
        const shape: Draw = {
            id: ID,
            type: "rect",
            startx: selectedShape.startx - padding,
            starty: selectedShape.starty - padding,
            width: selectedShape.width + padding * 2,
            height: selectedShape.height + padding * 2
        }
        ctx.strokeRect(
            shape.startx - padding,
            shape.starty - padding,
            shape.width + padding * 2,
            shape.height + padding * 2
        );

        ctx.restore();
        return { id: ID, shape };
    } else if (selectedShape.type === "circle") {
        const shape: Draw = {
            id: ID,
            type: "circle",
            centerx: selectedShape.centerx,
            centery: selectedShape.centery,
            radiusx: selectedShape.radiusx + padding,
            radiusy: selectedShape.radiusy + padding
        }
        ctx.beginPath();
        ctx.ellipse(
            shape.centerx,
            shape.centery,
            shape.radiusx,
            shape.radiusy,
            0,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        ctx.restore();
        return { id: ID, shape };
    }
    // shapes.push(shape)
    // ctx.strokeRect(shape.startx-padding, shape.starty-padding, shape.width+padding*2, shape.height+padding*2);
}