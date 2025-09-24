import React, { useEffect, useState } from 'react';
import './Sign.css'; // 假设样式文件名为 Sign.css
import SignName from '@/pages/workbench/components/SignName';
import { request } from '@umijs/max';
import { QRCode } from 'antd';
import { history } from '@umijs/max';
export default function Sign() {
  const [isSigned, setIsSigned] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(true); // 默认显示移动端签名弹窗

  const signNameUrl = (imgUrl: any) => {
    // 例如使用request发送POST请求
    const formData = new FormData();
    formData.append('signature', imgUrl);
    request('/api/purchaseitem/upload', {
      method: 'POST',
      data: formData,
      requestType: 'form',
    }).then(response => {
      const userInfo = JSON.parse(localStorage.userInfo || '{}');
      request('/api/user/update', {
        method: 'POST',
        data: {
          ...userInfo,
          currentUserId: userInfo.userId,
          signatureImageUrl: response.data
        }
      }).then(res => {
        history.replace('./user/login')
      })


      // 处理上传成功的逻辑
    })
  }
  useEffect(() => {
    // 模拟已签名状态
    // 检测屏幕大小，确定移动端页面显示
    if (window.innerWidth < 768) {
      setShowMobileModal(true);
    } else {
      setShowMobileModal(false);
    }

  }, []);


  return (
    <div className="sign-container">
      {/* PC端未签名状态 */}
      {!isSigned && !showMobileModal && (
        <div className="pc-sign-container">
          <h2>请先完成签名</h2>
          <div className="pc-sign-content">
            <p>首次登录系统请您手机连接校内wifi扫码设置您的签名</p>
            <div className="signature-placeholder">
              {/* 当前域名和端口的二维码，使用 qrcode 插件生成 */}

              <QRCode value={`${window.location.origin}`} />
            </div>
            <p className="instruction">签名完成后请刷新页面自动进入系统</p>
            <button className="refresh-btn" onClick={() => history.replace('./user/login')}>
              点此刷新
            </button>
          </div>
        </div>
      )}

      {/* 手机端签名弹窗 */}
      {showMobileModal && (
        <div className="mobile-sign-modal">
          <div className="modal-header">
            <span>请您先在下方设置您的签名，提交签名后进入系统</span>
            <button className="close-btn" onClick={() => setShowMobileModal(false)}>
              ×
            </button>
          </div>
            <SignName key={Math.random()} onConfirm={(imgUrl: any) => signNameUrl(imgUrl)} />
        </div>
      )}
    </div>
  );
}
