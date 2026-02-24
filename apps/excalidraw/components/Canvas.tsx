'use client'
import { useEffect, useRef, useState } from "react"
import DrawApi from "./DrawAPI"
import { Square, Circle, LineChart, Pencil, Hand, Move, Trash2, Type } from "lucide-react";

interface CursorProp {
    posx: number;
    posy: number;
}

function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasref = useRef<HTMLCanvasElement>(null)
    const [Whichelem, setWhichelem] = useState("")
    const [Coordinates, setCoordinates] = useState<CursorProp | null>(null)
    const [shape, setshape] = useState<{ width: number, height: number } | null>(null)
    const [name, setname] = useState("")

    useEffect(() => {
        (window as any).SelectedTool = Whichelem;
    }, [Whichelem]);
    console.log(name)
    useEffect(() => {
        if (!socket) return;
        const onMessage = (e: MessageEvent) => {
            try {
                const message = JSON.parse(e.data as string)
                if (message && (message.type === "corsor_move" || message.type === "cursor_move")) {
                    setname(message.name)
                    const corr = { posx: message.posx, posy: message.posy }
                    setCoordinates(corr)
                }
            } catch { }
        }
        socket.addEventListener("message", onMessage)
        return () => {
            socket.removeEventListener("message", onMessage)
        }
    }, [socket]);

    useEffect(() => {
        const width = window.innerWidth
        const height = window.innerHeight
        setshape({ width, height })
        const canvas = canvasref.current
        if (!canvas || !socket) return
        DrawApi(canvas, socket, roomId)
    }, [socket, roomId])

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            setshape({ width, height })
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    console.log(Whichelem)
    return (
        <>
            <div className="relative w-screen h-screen">
                <canvas width={shape?.width} height={shape?.height} className="border rounded-lg relative" ref={canvasref}></canvas>

                <div className="fixed top-[10%] flex-col left-2 z-30 flex justify-center items-center gap-2 border-gray-500 border rounded-md p-2 bg-gray-800/10">
                    <button className="text-white hover:cursor-pointer" onClick={() => (window as any).UndoOperation?.()}>Undo</button>
                    <button className="text-white hover:cursor-pointer" onClick={() => (window as any).RedoOperation?.()}>Redo</button>
                </div>

                <div className="fixed top-[25%] flex-col left-2 z-30 flex justify-center items-center gap-2 border-gray-500 border rounded-md p-2 bg-gray-800/10">
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'rectangle' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("rectangle")}
                        title="Rectangle"
                    >
                        <Square className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'circle' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("circle")}
                        title="Circle"
                    >
                        <Circle className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'line' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("line")}
                        title="Line"
                    >
                        <LineChart className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'pencil' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("pencil")}
                        title="Pencil"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'text' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("text")}
                        title="text"
                    >
                        <Type className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'pan' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("pan")}
                        title="Pan"
                    >
                        <Hand className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'move' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("move")}
                        title="Move"
                    >
                        <Move className="w-5 h-5" />
                    </button>
                    <button
                        className={`text-lg border border-gray-600 rounded-lg pointer ${Whichelem === 'delete' ? "text-red-400" : "text-gray-400"} hover:bg-gray-700 hover:text-white px-2 py-1 flex items-center justify-center`}
                        onClick={() => setWhichelem("delete")}
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                {Coordinates && (
                    <div
                        className="absolute z-50 pointer-events-none"
                        style={{
                            left: `${Coordinates.posx}px`,
                            top: `${Coordinates.posy}px`,
                        }}
                    >
                        <svg
                            className="w-6 h-6 text-blue-500 fill-current"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                        </svg>
                        <div className="ml-4 -mt-1 px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded whitespace-nowrap shadow-lg">
                            {name}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Canvas