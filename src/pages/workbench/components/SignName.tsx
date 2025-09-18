import React, { useRef, useEffect, useState } from 'react';
import { Button, Card, message } from 'antd';

interface SignNameProps {
  onConfirm: (dataURL: any) => void;
}

const SignatureButton: React.FC<SignNameProps> = ({ onConfirm }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef<boolean>(false);
  const [isPainted, setIsPainted] = useState<boolean>(false);

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // 设置Canvas上下文
      contextRef.current = canvas.getContext('2d');
      if (contextRef.current) {
        contextRef.current.lineWidth = 2;
        contextRef.current.lineCap = 'round';
        contextRef.current.strokeStyle = '#000';
      }

      // 自适应画布大小
      const resizeCanvas = () => {
        if (canvas && contextRef.current) {
          canvas.width = canvas.offsetWidth;
          canvas.height = canvas.offsetHeight;
          // 重新设置上下文属性，因为resize会重置Canvas
          contextRef.current.lineWidth = 2;
          contextRef.current.lineCap = 'round';
          contextRef.current.strokeStyle = '#000';
          // 清空画布以确保初始状态干净
          contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      // 使用requestAnimationFrame确保Canvas在DOM渲染后调整
      const raf = requestAnimationFrame(resizeCanvas);
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        cancelAnimationFrame(raf);
      };
    }
  }, []);

  // 获取坐标（兼容鼠标和触摸事件）
  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { offsetX: number; offsetY: number } => {
    const canvas = canvasRef.current!;
    let offsetX: number, offsetY: number;
    if (e.type.includes('touch')) {
      const rect = canvas.getBoundingClientRect();
      offsetX = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientX - rect.left;
      offsetY = (e as React.TouchEvent<HTMLCanvasElement>).touches[0].clientY - rect.top;
    } else {
      offsetX = (e as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetX;
      offsetY = (e as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetY;
    }
    return { offsetX, offsetY };
  };

  // 鼠标/触摸事件
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    if (contextRef.current) {
      contextRef.current.beginPath();
      const { offsetX, offsetY } = getCoordinates(e);
      contextRef.current.moveTo(offsetX, offsetY);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {

    if (!isDrawing.current || !contextRef.current) return;
    setIsPainted(true)
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    if (contextRef.current) {
      contextRef.current.closePath();
    }
  };

  // 清空画布
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      setIsPainted(false);
      message.success('签名已清空');
    }
  };

  // 保存签名
  const saveSignature = () => {
    // 如果没有签名，提示请签名，并返回
    if (!isPainted) {
      message.warning('请先签名');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'signature.png', { type: 'image/png' });
        onConfirm(file);
      }
    });
  };

  return (
    <Card>
      <div style={{ position: 'relative', width: '100%', height: 300 }}>
        <canvas
          ref={canvasRef}
          style={{ border: '1px solid #d9d9d9', width: '100%', height: '100%', backgroundColor: '#fff', touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Button type="primary" onClick={saveSignature} style={{ marginRight: 8 }}>
          保存签名
        </Button>
        <Button onClick={clearCanvas}>清空</Button>
      </div>
    </Card>
  );
};

export default SignatureButton;
