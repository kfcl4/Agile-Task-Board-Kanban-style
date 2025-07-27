from fastapi import APIRouter, WebSocket

router = APIRouter(prefix="/ws", tags=["WebSocket"])

connections = []

@router.websocket("/project/{project_id}")
async def websocket_endpoint(websocket: WebSocket, project_id: str):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 广播消息给所有连接者
            for conn in connections:
                await conn.send_text(data)
    except:
        connections.remove(websocket)
