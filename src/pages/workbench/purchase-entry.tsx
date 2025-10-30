import React, { useState, useEffect } from "react";
import { history } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  Select,
  InputNumber,
  Upload,
  Modal,
  Space,
  Radio,
  Card,
  Col,
  Row,
  Cascader,
  CascaderProps,
  Spin,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined
} from "@ant-design/icons";
import {
  PageContainer,
  ProDescriptions,
} from "@ant-design/pro-components";
import { request, useModel } from "@umijs/max";
import SignName from "./components/SignName";

const { Option } = Select;

interface Option {
  value: number;
  label: string;
  children?: Option[];
}

interface Unit {
  value: string;
  label: string;
}
// Add new interface for users
interface User {
  userId: number;
  id: number;
  name: string;
}
const defaultItem = {
  image: "",
  name: "",
  spec: "",
  brand: "",
  quantity: 1,
  unit: "",
  purchaseType: "1",
  price: undefined,
};

const PurchaseEntry: React.FC = () => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<any[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addTemplateModalVisible, setAddTemplateModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [addTemplateForm] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [excelFileList, setExcelFileList] = useState<any[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [spinning, setSpinning] = React.useState(false);
  const [categories, setCategories] = useState<Option[]>([{ categoryName: "无", id: 0 }]);
  const [users, setUsers] = useState<User[]>([]);
  const [formValues, setFormValues] = useState<any>({});
  const { initialState } = useModel('@@initialState');
  interface Option {
    id: number;
    categoryName: string;
    children?: Option[];
  }
  const [loading, setLoading] = useState({
    units: false,
    categories: false
  });

  // 图片上传模拟
  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
  };
  // <Modal
  //   open={showModal}
  //   onOk={handleModalOk}
  //   onCancel={() => setShowModal(false)}
  //   footer={[]}
  // >
  //   {/* 每次初始化SignName组件 */}

  //   {showModal && (<SignName key={Math.random()} onConfirm={(imgUrl: any) => signNameUrl(imgUrl)} />)}
  // </Modal>
  // const signNameUrl = (imgUrl: any)=>{
  //   // 例如使用request发送POST请求
  //   const formData = new FormData();
  //   formData.append('signature', imgUrl);
  //   // 加一个全局loading
  //   setShowModal(false);
  //   setSpinning(true)
  //   request('/api/purchaseitem/upload', {
  //     method: 'POST',
  //     data: formData,
  //     requestType: 'form',
  //   }).then(response => {
  //     let urlSrc = response.data
  //     return urlSrc
  //     // 处理上传成功的逻辑
  //   }).then(async (urlSrc) => {
  //     // 调用接口 / api / purchaseitem / add，post请求，form - data格式，字段分别是productName是商品名称，spec是规格，brandName是品牌，categoryLevel1Id是一级类目 ID，categoryLevel2Id是二级类目 ID，unit是单位，supplierName是供应商名称，purchaseType是采购类型（1 = 直采，2 = 定向采购），purchaseQuantity是采购数量，purchasePrice是采购单价，applicantName定向采购时必填（purchaseType = 2 时），applyDepartment申请部门（可为空），images是对应的图片资源，userId是用户ID
  //     const userId = initialState?.currentUser?.userId || ''
  //     const userName = initialState?.currentUser?.name || ''
  //     const formData = new FormData();
  //     const purchaseTypeName = users.find(user => user.userId === formValues.applyUser)?.name || '';
  //     formData.append('applyUser', purchaseTypeName || userName);
  //     formData.append('signatureImageUrl', urlSrc);
  //     formData.append('purchaseType', formValues.purchaseType || '');
  //     formData.append('applyUserId', formValues.applyUser || userId || '');
  //     items.map((item, index) => {
  //       console.log(item,'item');
  //       formData.append(`items[${index}].productName`, item.name);
  //       formData.append(`items[${index}].spec`, item.spec);
  //       formData.append(`items[${index}].brandName`, item.brand);
  //       formData.append(`items[${index}].categoryLevel1Id`, item.category[0]);
  //       formData.append(`items[${index}].categoryLevel2Id`, item.category[1]);
  //       formData.append(`items[${index}].unit`, item.unit);
  //       formData.append(`items[${index}].quantity`, item.quantity);
  //       formData.append(`items[${index}].price`, item.price);
  //       formData.append(`items[${index}].supplierName`, item.supplierName);
  //       if (item.image){
  //         item.image.fileList.forEach((file: any) => {
  //           formData.append(`items[${index}].imageFiles`, file.originFileObj);
  //         })
  //       }

  //     });
  //     await request('/api/order/add', {
  //       method: 'POST',
  //       data: formData,
  //       requestType: 'form',
  //     })
  //     message.success('订单创建成功');
  //     handleModalOk()
  //   }).catch(error => {
  //     console.error('订单创建失败:', error);
  //   }).finally(() => {
  //     setSpinning(false)
  //   })
  // }
  // Fetch users when purchase type is定向申请采购
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
      setUsers(response.data.records || []); // Adjust based on actual API response structure
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
    }
  };
  useEffect(() => {
    fetchUsers()
  }, [])
  // Update the useEffect to also fetch users when needed
  useEffect(() => {
    if (addModalVisible) {
      fetchUnits();
      fetchCategories();
    } else {
      setFileList([]);
    }
  }, [addModalVisible]);
  const handleAddItem = (values: any) => {
    setItems([...items, { ...values }]);
    setAddModalVisible(false);
    addForm.resetFields();
    setFileList([]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };


  const handleFinish = async (values: any) => {
    // 如果物品列表为空，提示不能提交
    if (items.length === 0) {
      message.error('请添加物品');
      return;
    }
    //校验必填项
    // setShowModal(true);
    // 调用接口 / api / purchaseitem / add，post请求，form - data格式，字段分别是productName是商品名称，spec是规格，brandName是品牌，categoryLevel1Id是一级类目 ID，categoryLevel2Id是二级类目 ID，unit是单位，supplierName是供应商名称，purchaseType是采购类型（1 = 直采，2 = 定向采购），purchaseQuantity是采购数量，purchasePrice是采购单价，applicantName定向采购时必填（purchaseType = 2 时），applyDepartment申请部门（可为空），images是对应的图片资源，userId是用户ID
    const userId = initialState?.currentUser?.userId || ''
    const userName = initialState?.currentUser?.name || ''
    const signatureImageUrl = initialState?.currentUser?.signatureImageUrl || ''
    const formData = new FormData();
    const purchaseTypeName = users.find(user => user.userId === values.applyUser)?.name || '';
    formData.append('applyUser', userName);
    formData.append('addSignatureImageUrl', signatureImageUrl);
    formData.append('purchaseType', values.purchaseType || '');
    formData.append('applyUserId', userId || '');
    formData.append(`purchaseSignName`, purchaseTypeName);
    formData.append(`purchaseSignId`, values.applyUser||"");
    items.map((item, index) => {
      console.log(item, 'item');
      formData.append(`items[${index}].productName`, item.name);
      formData.append(`items[${index}].spec`, item.spec);
      formData.append(`items[${index}].brandName`, item.brand);
      formData.append(`items[${index}].categoryLevel1Id`, item.category ? item.category[0] : '');
      formData.append(`items[${index}].categoryLevel2Id`, item.category ? item.category[1] : '');
      formData.append(`items[${index}].unit`, item.unit);
      formData.append(`items[${index}].isFixedAsset`, '0');// 低值易耗品
      formData.append(`items[${index}].quantity`, item.quantity);
      formData.append(`items[${index}].price`, item.price);
      formData.append(`items[${index}].supplierName`, item.supplierName);
      if (item.image) {
        item.image.fileList.forEach((file: any) => {
          formData.append(`items[${index}].imageFiles`, file.originFileObj);
        })
      }

    });
    await request('/api/order/add', {
      method: 'POST',
      data: formData,
      requestType: 'form',
    })
    message.success('订单创建成功');
    history.push('/workbench/stock-entry');
    handleModalOk()
  };
  const srcHandler = (fileObj: any) => {
    if (fileObj.file) {
      // 获取url工具
      const URL = window.URL || window.webkitURL;
      return URL.createObjectURL(fileObj.file);
    }
    return fileObj.url || fileObj.preview || '';
  }
  const handleModalOk = () => {
    form.resetFields();
    setItems([]);
  };

  // Fetch units and categories when modal opens
  useEffect(() => {
    if (addModalVisible) {
      fetchUnits();
      fetchCategories();
    } else {
      // Clear file list when modal closes
      setFileList([]);
    }
  }, [addModalVisible]);

  const fetchUnits = async () => {
    setLoading(prev => ({ ...prev, units: true }));
    try {
      const response = await request('/api/purchaseitem/units');
      setUnits(response.map((item: any) => ({
        value: item,
        label: item
      })));
    } catch (error) {
      console.error('Failed to fetch units:', error);
    } finally {
      setLoading(prev => ({ ...prev, units: false }));
    }
  };

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    try {
      const response = await request('/api/category/tree');
      const dataList = response.data.categories;
      console.log(dataList, 'dataList');
      setCategories(dataList);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };
  const downloadTemplate = () => {
    const url = '/api/stat/lowValueDownloadTemplate';
    const link = document.createElement('a');
    link.href = url;
    link.download = '低值易耗品导入模板.xlsx';
    link.click();
  };
  const handleAddTemplateFinish = async (values: any) => {
    if (excelFileList.length === 0) {
      message.error('请上传文件');
      return;
    }
    const formData = new FormData();
    excelFileList.forEach(file => {
      formData.append('file', file.originFileObj);
    });
    const purchaseTypeName = users.find(user => user.userId === values.applyUser)?.name || '';
    const userId = initialState?.currentUser?.userId || ''
    const userName = initialState?.currentUser?.name || ''
    const signatureImageUrl = initialState?.currentUser?.signatureImageUrl || ''
    formData.append('applyUser', userName);
    formData.append('signatureImageUrl', signatureImageUrl);
    formData.append('purchaseType', values.purchaseType || '');
    formData.append('applyUserId', userId || '');
    formData.append(`purchaseSignName`, purchaseTypeName);
    formData.append(`purchaseSignId`, values.applyUser||"");
    setSpinning(true);
    try {
      const response = await request('/api/stat/lowValueImport', {
        method: 'POST',
        data: formData,
        requestType: 'form',
      });
      if (response.code === 200) {
        message.success('导入成功');
        setAddTemplateModalVisible(false);
        addTemplateForm.resetFields();
        setFileList([]);
        history.push('/workbench/stock-entry');
      } else {
        message.error(response.msg || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      message.error('导入失败');
    } finally {
      setSpinning(false);
    }
  };
  console.log(formValues, 'formValuesformValues');
  return (
    <PageContainer>
      <Spin spinning={spinning} size="large" tip="订单创建中。。。" fullscreen={true} />
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ purchaseType: "1" }}
      >

        <Form.Item style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button
            type={"primary"}
            style={{ marginRight: 8 }}
            onClick={() => downloadTemplate()}
          >
            下载导入模板
          </Button>
          {/* 这是一个导入按钮，点击后可批量导入低值易耗品采购单 */}
          {/* 还有其他参数 */}
          {/* <Upload
            accept=".xls,.xlsx"
            name="file"
            data={{ applyUserId: initialState?.currentUser?.userId || '', applyUser: initialState?.currentUser?.name || '' }}
            action="/api/stat/lowValueImport"
            onChange={(info) => {
              if (info.file.status !== 'uploading') {
                console.log(info.file, info.fileList);
              }
              if (info.file.status === 'done') {
                message.success(`${info.file.name} 导入成功`);
                setTimeout(() => {
                  history.push('/workbench/stock-entry-record');
                }, 1000);
              } else if (info.file.status === 'error') {
                message.error(`${info.file.name} 导入失败`);
              }
            }}
          >
            <Button type={"primary"} >添加物品</Button>

          </Upload> */}
          <Button
            type={"primary"}
            onClick={() => {
              setAddTemplateModalVisible(true);
            }}
          >
            导入物品
          </Button>
        </Form.Item>
        {items.map((item, idx) => (
          <Card
            key={idx}
            style={{ marginBottom: 16 }}
            title={`物品${idx + 1}`}
            extra={
              items.length > 1 ? (
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveItem(idx)}
                />
              ) : null
            }
          >
            <Row gutter={16} align="middle" justify="center" wrap={true}>
              <Col flex="100px" style={{ marginBottom: 8 }}>
                {item.image ? (
                  <img
                    src={srcHandler(item.image)}
                    alt="商品"
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      background: "#f5f5f5",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa",
                    }}
                  >
                    无图片
                  </div>
                )}
              </Col>
              <Col flex="auto">
                <ProDescriptions
                  column={2}
                  bordered
                  size="middle"
                  dataSource={item}
                  columns={[
                    { title: "名称", dataIndex: "name" },
                    { title: "规格", dataIndex: "spec" },
                    { title: "品牌", dataIndex: "brand" },
                    {
                      title: "数量",
                      dataIndex: "quantity",
                      render: (_, record, index,) => (
                        <InputNumber
                          parser={(value) => parseInt(value || '0', 10)}
                          min={1}
                          max={99999}
                          value={record.quantity}
                          onChange={(value) => {
                            const newItems = [...items];
                            newItems[idx].quantity = value;
                            setItems(newItems);
                          }}
                        />
                      ),
                    },
                    { title: "单位", dataIndex: "unit" },
                    {
                      title: "单价",
                      dataIndex: "price",
                      render: (_, record) =>
                        record.price !== undefined ? record.price : "-",
                    },
                  ]}
                />
              </Col>
            </Row>
          </Card>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            block
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            添加物品
          </Button>
        </Form.Item>
        <Modal
          open={addModalVisible}
          title="添加物品"
          onCancel={() => {
            setAddModalVisible(false);
            setFileList([]);
            addForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={addForm}
            layout="vertical"
            onFinish={handleAddItem}
            initialValues={{ ...defaultItem }}
          >
            <Form.Item label="商品图片" name="image" >
              <Upload
                beforeUpload={(file) => {
                  // Prevent automatic upload
                  return false;
                }}
                fileList={fileList}
                onChange={({ fileList: newFileList }) => {
                  // Limit to 4 files
                  if (newFileList.length > 4) {
                    setFileList(newFileList.slice(0, 4));
                    return;
                  }
                  console.log(newFileList, 'newFileList');
                  setFileList(newFileList);

                  // Save file URLs to form
                  // const urls = newFileList.map(f =>
                  //   f.url || (f.originFileObj ? URL.createObjectURL(f.originFileObj) : '')
                  // );
                  addForm.setFieldsValue({ images: newFileList });
                }}
                listType="picture-card"
                multiple
                maxCount={4}
                onPreview={handlePreview}
              >
                {fileList.length < 4 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
            <Form.Item
              label="商品名称"
              name="name"
              rules={[{ required: true, message: "请输入商品名称" }]}
            >
              <Input maxLength={20} placeholder="请输入商品名称" />
            </Form.Item>
            <Form.Item
              label="商品规格"
              name="spec"
              rules={[{ required: true, message: "请输入商品规格" }]}
            >
              <Input maxLength={20} placeholder="如：A4-100页" />
            </Form.Item>
            <Form.Item label="品牌名" name="brand" rules={[{ required: true, message: "请先填写品牌名" }]}>
              <Input maxLength={20} placeholder="请输入品牌名" />
            </Form.Item>
            <Form.Item label="供应商名称" name="supplierName">
              <Input maxLength={20} placeholder="请输入供应商名称" />
            </Form.Item>
            <Form.Item label="商品分类" name="category" >
              <Cascader
                options={categories}
                fieldNames={{ label: 'categoryName', value: 'id', children: 'children' }}
                placeholder="请选择商品分类"
                loading={loading.categories}
              />
            </Form.Item>
            <Form.Item
              label="数量"
              name="quantity"
              rules={[{ required: true, message: "请输入数量" }]}
            >
              <InputNumber parser={(value) => parseInt(value || '0', 10)} min={1} max={99999} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="单位"
              name="unit"
              rules={[{ required: true, message: "请选择单位" }]}
            >
              <Select
                placeholder="请选择单位"
                showSearch
                filterOption={(input, option) =>
                  String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                }
                filterSort={(optionA, optionB) =>
                  String(optionA?.children ?? '').toLowerCase().localeCompare(String(optionB?.children ?? '').toLowerCase())
                }
                loading={loading.units}
              >
                {units.map(unit => (
                  <Option key={unit.value} value={unit.value}>
                    {unit.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="采购单价(元)"
              name="price"
              rules={[{ required: true, message: "请输入单价" }]}
            >
              <InputNumber
                parser={(value) => parseInt(value || '0', 10)}
                min={1}
                max={999999}
                style={{ width: "100%" }}
                placeholder="请输入单价"
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button onClick={() => {
                  setAddModalVisible(false);
                  form.resetFields();
                  setFileList([]);
                }}>取消</Button>
                <Button type="primary" htmlType="submit">
                  添加
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          open={addTemplateModalVisible}
          title="导入物品"
          onCancel={() => {
            setAddTemplateModalVisible(false);
          }}
          footer={null}
        >
          <Form
            form={addTemplateForm}
            layout="vertical"
            onFinish={handleAddTemplateFinish}
            initialValues={{ purchaseType: "1" }}
          >
            <Form.Item
              label="采购类型"
              name="purchaseType"
              rules={[{ required: true, message: "请选择采购类型" }]}
            >
              <Radio.Group>
                <Radio value="1">直采</Radio>
                <Radio value="2">定向申请采购</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.purchaseType !== curValues.purchaseType}>
              {({ getFieldValue }) => {
                const purchaseType = getFieldValue('purchaseType');
                if (purchaseType === '2') {
                  return (
                    <Form.Item
                      label="申购申请人"
                      name="applyUser"
                      rules={[{ required: true, message: "请选择申购申请人" }]}
                      required
                    >
                    <Select
                    placeholder="请选择申购申请人"
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        filterSort={(optionA, optionB) =>
                          String(optionA?.children ?? '').toLowerCase().localeCompare(String(optionB?.children ?? '').toLowerCase())
                        }
                    loading={users.length === 0 && purchaseType === '2'}
                  >
                    {users.map(user => (
                      <Option key={user.userId} value={user.userId}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                  </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
            <Form.Item>
              <Upload
                accept=".xls,.xlsx"
                name="file"
                fileList={excelFileList}
                beforeUpload={(file) => {
                  // Prevent automatic upload
                  return false;
                }}
                onChange={({ fileList: newFileList }) => {
                  // Limit to 1 file
                  if (newFileList.length > 1) {
                    setExcelFileList(newFileList.slice(0, 1));
                    return;
                  }
                  setExcelFileList(newFileList);
                }}
              >
                <Button icon={<Upload />}>点击上传低值易耗品采购单</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Space style={{ float: 'right' }}>
                <Button htmlType="button" onClick={() => addTemplateForm.resetFields()}>
                  重置
                </Button>
                <Button type="primary" htmlType="submit">
                  提交
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
        <Form.Item
          label="采购类型"
          name="purchaseType"
          rules={[{ required: true, message: "请选择采购类型" }]}
        >
          <Radio.Group>
            <Radio value="1">直采</Radio>
            <Radio value="2">定向申请采购</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prevValues, curValues) => prevValues.purchaseType !== curValues.purchaseType}>
          {({ getFieldValue }) => {
            const purchaseType = getFieldValue('purchaseType');
            if (purchaseType === '2') {
              return (
                <Form.Item
                  label="申购申请人"
                  name="applyUser"
                  rules={[{ required: true, message: "请选择申购申请人" }]}
                  required
                >
                  <Select
                    placeholder="请选择申购申请人"
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    filterSort={(optionA, optionB) =>
                      String(optionA?.children ?? '').toLowerCase().localeCompare(String(optionB?.children ?? '').toLowerCase())
                    }
                    loading={users.length === 0 && purchaseType === '2'}
                  >
                    {users.map(user => (
                      <Option key={user.userId} value={user.userId}>
                        {user.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              );
            }
            return null;
          }}
        </Form.Item>
        <Form.Item>
          <Space>
            <Button htmlType="button" onClick={() => form.resetFields()}>
              重置
            </Button>
            <Button type="primary" htmlType="submit">
              提交采购单
            </Button>
          </Space>
        </Form.Item>
      </Form >
    </PageContainer >
  );
};

export default PurchaseEntry;

