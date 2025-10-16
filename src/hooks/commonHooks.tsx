// src/hooks/commonHooks.tsx
import { Button, Modal, Tag } from "antd";
import { useHandleShelf } from './handleShelf';
import { useHandleOnline } from './handleOnline';
import { useHandleOffline } from './handleOffline';
import { useHandleApply } from './handleApply';
import { useHandleUrgeReview } from './handleUrgeReview';
import { useHandleUrgeShelf } from './handleUrgeShelf';
import { useHandleViewRejectReason } from './handleViewRejectReason';
import { useHandleSign } from './handleSign';
import { useHandleUrgeSign } from './handleUrgeSign';
import { useHandleDistribute } from './handleDistribute';
import { useHandleUrgeApplyReview } from './handleUrgeApplyReview';
import { useHandleReview } from './review'
import { useDownloadBuyOrder } from './downloadBuyOrder'
import { useDownloadApplyOrder } from './downloadApplyOrder'
import { useHandleApplyConfirm } from "./handleApplyConfirm";
import { useNavigate } from "react-router-dom";

import {
  useHandleViewReason,
} from './viewReason'
import { useModel } from "@umijs/max";

export interface ItemData {
  auditStatus: '0' | '1' | '2' | '3'; // 上架状态：0-未上架, 1-通过未上架, 2-被驳回, 3-已上架
  claimStatus: '0' | '1' | '2' | '3'; // 申领状态：null-初始状态, 0-未申领, 1-已通过, 2-被驳回, 3-已申领
  [key: string]: any;
}

interface StatusConfig {
  color: string;
  text: string;
}

interface ActionConfig {
  key: string;
  label: string;
  color?: string;
  type?: "primary" | "default" | "danger" | "link" | "dashed";
  onClick?: () => void;
}

// 上架状态：0-未上架,1-通过未上架,2-被驳回,3-已上架
// 申领状态：null-初始状态 0-未申领,1-已通过,2-被驳回,3-已申领
// 状态文案配置
const statusColorMap: Record<number, string> = {
  0: 'orange', // 未上架/未申领
  1: 'blue',    // 通过未上架/已通过
  2: 'red',     // 被驳回
  3: 'green',   // 已入库/已申领
};

export const useStatusActions = (item: ItemData, isAdmin: boolean = false, isProduct: boolean) => {
  const { handleReview } = useHandleReview();
  const { downloadBuyOrder } = useDownloadBuyOrder();
  const { downloadApplyOrder } = useDownloadApplyOrder();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const { handleApplyConfirm } = useHandleApplyConfirm();
  const { handleViewReason } = useHandleViewReason();
  const { handleShelf } = useHandleShelf();
  const { handleOnline } = useHandleOnline();
  const { handleOffline } = useHandleOffline();
  const { handleApply } = useHandleApply();
  const { handleUrgeReview } = useHandleUrgeReview();
  const { handleUrgeShelf } = useHandleUrgeShelf();
  const { handleViewRejectReason } = useHandleViewRejectReason();
  const { handleSign } = useHandleSign();
  const { handleUrgeSign } = useHandleUrgeSign();
  const { handleDistribute } = useHandleDistribute();
  const { handleUrgeApplyReview } = useHandleUrgeApplyReview();
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  // 状态配置 - 优化版本
  const getStatusConfig = (): StatusConfig => {
    // 如果isProduct字段是真，那么只有已上架，和待入库审核以及被驳回三种状态
    if (isProduct) {
      if (item.itemStatus == 0) {
        return { color: statusColorMap[3], text: '已上架' };
      }
      if (item.itemStatus == 1) {
        return { color: statusColorMap[0], text: '待上架' };
      }
      return { color: "green", text: "已上架" };
    }
    // 如果item中存在orderNo值，那么有三种状态，0待审核，1通过，2驳回
    if (item.auditStatus !== undefined) {
      const buyStatusNum = parseInt(item.auditStatus, 10);
      switch (buyStatusNum) {
        case 0:
          return { color: statusColorMap[0], text: "待审核" };
        case 1:
          return { color: statusColorMap[1], text: "已通过" };
        case 2:
          return { color: statusColorMap[2], text: "已驳回" };
        default:
          return { color: "green", text: "已上架" };
      }
    }
    // 如果item中存在claimStatus值，那么有三种状态，0待审核，1通过，2驳回，3完成
    if (item.claimStatus !== undefined) {
      const applyStatusNum = parseInt(item.claimStatus, 10);
      switch (applyStatusNum) {
        case 0:
          return { color: statusColorMap[0], text: "待审核" };
        case 1:
          return { color: statusColorMap[1], text: "已通过" };
        case 2:
          return { color: statusColorMap[2], text: "已驳回" };
        case 3:
          return { color: statusColorMap[3], text: "已完成" };
        case 4:
          return { color: statusColorMap[1], text: "待签收" };
        default:
          return { color: "green", text: "已完成" };
      }
    }
    return { color: "green", text: "已完成" };
  };

  // 操作按钮配置
  const getActionConfig = (): ActionConfig[] => {
    // 根据用户类型（管理员/普通用户）和物品状态确定操作按钮
    const actions: ActionConfig[] = [];

    // 如果isProduct字段是真，那么只有去上架按钮
    if (isProduct) {

      if (item.itemStatus === 1) {
        actions.push({
          key: "去上架",
          label: "去上架",
          type: "primary",
          onClick: () => handleOnline(modal, item),
        });
      }
      if (item.itemStatus === 0) {
        //     ,
        // {
        //   key: "修改上架数量",
        //   label: "修改上架数量",
        //   type: "primary",
        //   onClick: () => handleShelf(modal, item),
        //       }
        actions.push({
          key: "下架",
          label: "下架",
          type: "primary",
          onClick: () => handleOffline(modal, item, false),
        }
        );
      }
      return actions;
    }
    // 如果isAdmin为真，
    if (isAdmin) {
      // 如果item中存在orderNo值，那么有三种状态，0待审核，1通过，2驳回
      if (item.auditStatus !== undefined) {
        if (item.auditStatus == '0') {
          console.log(item,'itemitemitem');
          actions.push({
            key: "去审核",
            label: "去审核",
            type: "primary",
            onClick: () => handleReview(modal, item),
          });
        } else if (item.auditStatus == '1') {
          console.log(item.purchaseType, 'item.purchaseType');
          // if (item.purchaseType === 1) {
          // actions.push({
          //   key: "去上架",
          //   label: "去上架",
          //   type: "primary",
          //   onClick: () => navigate("/workbench/claim"),
          // });
          actions.push({
            key: "下载采购单",
            label: "下载采购单",
            type: "primary",
            onClick: () => downloadBuyOrder(modal, item),
          });
          // }
        } else if (item.auditStatus == '2') {
          actions.push({
            key: "查看原因",
            label: "查看原因",
            type: "primary",
            onClick: () => handleViewReason(modal, item),
          });
        }
      }
      // 如果item中存在applyNum值，那么有三种状态，0待审核，1通过，2驳回,3完成
      if (item.claimStatus !== undefined) {
        const applyStatusNum = parseInt(item.claimStatus, 10);
        switch (applyStatusNum) {
          case 0: // 未申领
            actions.push({
              key: "去审核",
              label: "去审核",
              type: "primary",
              onClick: () => handleApplyConfirm(modal, item),
            });
            break;
          case 1: // 已通过
            actions.push({
              key: "催签收",
              label: "催签收",
              type: "primary",
              onClick: () => handleUrgeSign(modal, item),
            });
            break;
          case 2: // 被驳回
            actions.push({
              key: "查看原因",
              label: "查看原因",
              type: "primary",
              onClick: () => handleViewRejectReason(modal, item),
            });
            break;
          case 3: // 已申领
            actions.push({
              key: "下载申领单",
              label: "下载申领单",
              type: "primary",
              onClick: () => downloadApplyOrder(modal, item),
            });
            break;
          case 4: // 已申领
            actions.push({
              key: "催签收",
              label: "催签收",
              type: "primary",
              onClick: () => handleUrgeSign(modal, item),
            });
            break;
        }
      }
    } else {
      // 如果item中存在orderNo值，那么有三种状态，0待审核，1通过，2驳回
      if (item.auditStatus !== undefined) {
        if (item.auditStatus == '0') {
          actions.push({
            key: "催审核",
            label: "催审核",
            type: "primary",
            onClick: () => handleUrgeReview(modal, item),
          });
        } else if (item.auditStatus == '1') {
          if (item.purchaseType === 1) {
            // actions.push({
            //   key: "去申领",
            //   label: "去申领",
            //   type: "primary",
            //   //路由跳转到/workbench/apply-record
            //   onClick: () => navigate("/workbench/apply-record")
            // });
          } else {
            // actions.push({
            //   key: "签收",
            //   label: "签收",
            //   type: "primary",
            //   //路由跳转到/workbench/apply-record
            //   onClick: () => handleSign(modal, item)
            // });
          }
        } else if (item.auditStatus == '2') {
          actions.push({
            key: "查看原因",
            label: "查看原因",
            type: "primary",
            onClick: () => handleViewReason(modal, item),
          });
        }
      }
      // 如果item中存在applyNum值，那么有三种状态，0待审核，1通过，2驳回,3完成
      if (item.claimStatus !== undefined) {
        const applyStatusNum = parseInt(item.claimStatus, 10);
        switch (applyStatusNum) {
          case 0: // 未申领
            actions.push({
              key: "催审核",
              label: "催审核",
              type: "primary",
              onClick: () => handleUrgeApplyReview(modal, item),
            });
            break;
          case 1: // 已通过
            actions.push({
              key: "签收",
              label: "签收",
              type: "primary",
              onClick: () => handleSign(modal, item),
            });
            break;
          case 4: // 已通过
            actions.push({
              key: "签收",
              label: "签收",
              type: "primary",
              onClick: () => handleSign(modal, item),
            });
            break;
          case 2: // 被驳回
            actions.push({
              key: "查看原因",
              label: "查看原因",
              type: "primary",
              onClick: () => handleViewRejectReason(modal, item),
            });
            break;
          case 3: // 已申领
            // 只有当前登录人等于申领人才有这个按钮
            const productCount = item.items.reduce((acc: any, curr: { quantity: any; claimQuantity: any; }) => acc + (curr.quantity || curr.claimQuantity), 0);
            const everyOverOne = item.items.every((curr: any) => (curr.quantity || curr.claimQuantity) > 1);
            if (currentUser?.userId === item.applyUserId && productCount > 1 && everyOverOne) {
              actions.push({
                key: "分发",
                label: "分发",
                type: "primary",
                onClick: () => handleDistribute(modal, item)
              });
            }
            break;
        }
      }
    }
    return actions;
  };

  // 渲染状态标签
  const renderStatusTag = () => {
    const statusConfig = getStatusConfig();
    return <Tag color={statusConfig.color} style={{ margin: 0 }}>{statusConfig.text}</Tag>;
  };

  // 渲染操作按钮
  const renderActionButtons = () => {
    const actions = getActionConfig();
    return actions.map((action) => (
      <>
        <Button
          key={action.key}
          type={action.type || "primary"}
          onClick={action.onClick}
          size="small"
          style={{ marginLeft: 8, marginTop: 4 }}
        >
          {action.label}
        </Button>
        {contextHolder}
      </>


    ));
  };

  return { renderStatusTag, renderActionButtons };
};
