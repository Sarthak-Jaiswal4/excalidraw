import CanvaHeader from "@/components/CanvaHeader"
import CanvasComp from "@/components/canvas/CanvasComp"

export default async function Page({ params }: { params: Promise<{ roomid: string }> }) {
    const roomid =(await params).roomid
    return (
        <>
        <div className="relative w-full h-screen">
            <CanvaHeader />
            <div className="absolute inset-0">
                <CanvasComp roomid={roomid} />
            </div>
        </div>
        </>
    )
}