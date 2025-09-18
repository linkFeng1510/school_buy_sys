import { Modal, Button, message, Radio } from 'antd';
import { ItemData } from './commonHooks';
import { useEffect, useState } from 'react'; // Fixed import: removed duplicate 'use'
import { request } from '@umijs/max';

// Define proper types for user data
interface UserRole {
  roleName: string;
  roleId: number;
}

interface User {
  roles: UserRole[];
  // Add other user properties if needed, e.g., id, name, etc.
}

export const useHandleUrgeReview = () => {
  const [users, setUsers] = useState<User[]>([]); // Typed state
  const fetchUsers = async () => {
    try {
      const response = await request('/api/user/list', {
        method: 'POST',
        data: {
          pageNum: 1,
          pageSize: 100,
          status: '1',
        },
      });

      const userList = response.data?.records || [];

      const filteredUsers: User[] = [];
      userList.forEach((userItem: User) => {
        userItem.roles.forEach((role) => {
          if (role.roleId === 2 || role.roleName === '库管') {
            filteredUsers.push(userItem);
          }
        });
      });

      // Create options before setting state
      const options = filteredUsers.map((user: any) => ({
        value: user.userId,
        label: `库管：${user.name} ${user.phoneNumber}`,
      }));

      setUsers(filteredUsers);

      // Return options for immediate use
      return options;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  };

  const handleUrgeReview = async (modal: any, item: ItemData) => {
    const options = await fetchUsers();
    console.log(options, 'options');
    const config = {
      title: '催审核',
      content: (
        <div>
          <Radio.Group
            defaultValue={1}
            options={options}
          />
        </div>
      ),
      onOk: () => {
        message.success('请拨打手机号');
      },
    };
    modal.info(config);
  };
  return { handleUrgeReview };
};
