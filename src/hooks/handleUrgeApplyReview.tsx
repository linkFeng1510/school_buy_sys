import { request } from "@umijs/max";
import { message, Radio } from "antd";
import { useState } from "react"; // Fixed import: removed duplicate 'use'
import { ItemData } from "./commonHooks";

// Define proper types for user data
interface UserRole {
  roleName: string;
  roleId: number;
}

interface User {
  roles: UserRole[];
  // Add other user properties if needed, e.g., id, name, etc.
}

export const useHandleUrgeApplyReview = () => {
  const [users, setUsers] = useState<User[]>([]); // Typed state
  const fetchUsers = async (item: any) => {
    const isFixedAsset = item.items.some((ii: { isFixedAsset: number }) => {
      return ii.isFixedAsset === 1;
    });
    try {
      const response = await request("/api/user/list", {
        method: "POST",
        data: {
          pageNum: 1,
          pageSize: 100,
          status: "1",
        },
      });

      const userList = response.data?.records || [];

      const filteredUsers: User[] = [];
      userList.forEach((userItem: User) => {
        userItem.roles.forEach((role) => {
          if (role.roleId === 2 || role.roleName.includes("库管")) {
            if (isFixedAsset && role.roleName.includes("资产")) {
              filteredUsers.push(userItem);
            }
            if (!isFixedAsset && role.roleName.includes("低值")) {
              filteredUsers.push(userItem);
            }
          }
        });
      });

      // Create options before setting state
      const options = filteredUsers.map((user: any) => ({
        value: user.userId,
        label: `${user.name}: ${user.phoneNumber}`,
      }));
      setUsers(filteredUsers);
      // Return options for immediate use
      return options;
    } catch (error) {
      return [];
    }
  };

  const handleUrgeApplyReview = async (modal: any, item: ItemData) => {
    const options = await fetchUsers(item);
    const config = {
      title: "催审核",
      content: (
        <div>
          <Radio.Group defaultValue={1} options={options} />
        </div>
      ),
      onOk: () => {
        message.success("请拨打手机号");
      },
    };
    modal.info(config);
  };
  return { handleUrgeApplyReview };
};
