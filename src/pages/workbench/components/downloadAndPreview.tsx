import React, { useState, useEffect } from 'react';
import { Button, Select, Table, Modal, message } from 'antd';
import * as XLSX from 'xlsx';
import type { ColumnsType } from 'antd/es/table';

interface MergeCell {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

interface CellSpan {
  rowSpan: number;
  colSpan: number;
}

const ExcelViewer: React.FC = () => {
  const [data, setData] = useState<string[][]>([]);
  const [merges, setMerges] = useState<MergeCell[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [currentSheet, setCurrentSheet] = useState<string>('');
  const [colCount, setColCount] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // 加载静态文件
  const loadExcelFile = async (sheetName?: string) => {
    try {
      const response = await fetch('/sample.xlsx'); // 修改为你的文件路径
      if (!response.ok) {
        message.error('无法加载文件！');
        return;
      }
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      setSheetNames(workbook.SheetNames);
      const targetSheet = sheetName || workbook.SheetNames[0];
      setCurrentSheet(targetSheet);
      const worksheet = workbook.Sheets[targetSheet];
      const jsonData: any = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      const mergeData = worksheet['!merges'] || [];
      const range = worksheet['!ref']
        ? XLSX.utils.decode_range(worksheet['!ref'])
        : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
      const maxRows = range.e.r + 1;
      const maxCols = range.e.c + 1;
      const filledData = Array.from({ length: maxRows }, (_, rowIndex) =>
        Array.from({ length: maxCols }, (_, colIndex) => jsonData[rowIndex]?.[colIndex] || '')
      );
      setData(filledData);
      setMerges(mergeData);
      setColCount(maxCols);
    } catch (error) {
      console.error('加载文件失败:', error);
      message.error('文件加载失败！');
    }
  };

  // 初始化加载文件
  useEffect(() => {
    loadExcelFile();
  }, []);

  const handlePreview = () => {
    if (data.length === 0) {
      message.warning('文件尚未加载完成！');
      return;
    }
    setIsModalVisible(true);
  };

  const handleSheetChange = (sheetName: string) => {
    loadExcelFile(sheetName);
  };

  const handleDownload = () => {
    if (data.length === 0) {
      message.warning('没有数据可下载！');
      return;
    }
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    worksheet['!merges'] = merges;
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, currentSheet || 'Sheet1');
    XLSX.writeFile(workbook, 'downloaded_file.xlsx');
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const getCellSpan = (rowIndex: number, colIndex: number): CellSpan => {
    for (const merge of merges) {
      const { s, e } = merge;
      if (rowIndex >= s.r && rowIndex <= e.r && colIndex >= s.c && colIndex <= e.c) {
        if (rowIndex === s.r && colIndex === s.c) {
          return {
            rowSpan: e.r - s.r + 1,
            colSpan: e.c - s.c + 1,
          };
        }
        return { rowSpan: 0, colSpan: 0 };
      }
    }
    return { rowSpan: 1, colSpan: 1 };
  };

  const columns: ColumnsType<any> = Array.from({ length: colCount }, (_, colIndex) => ({
    title: XLSX.utils.encode_col(colIndex),
    dataIndex: colIndex.toString(),
    key: colIndex.toString(),
    align: 'center' as const,
    onCell: (_, rowIndex) => {
      if (rowIndex === undefined) return {};
      return getCellSpan(rowIndex, colIndex);
    },
  }));

  const tableData = data.map((row, rowIndex) =>
    row.reduce(
      (acc, cell, colIndex) => {
        acc[colIndex] = cell;
        return acc;
      },
      { key: rowIndex } as Record<string, any>
    )
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <Button type="primary" onClick={handlePreview} disabled={data.length === 0}>
          预览
        </Button>
        {data.length > 0 && (
          <Button type="primary" onClick={handleDownload}>
            下载 XLSX 文件
          </Button>
        )}
      </div>

      <Modal
        title="Excel 预览"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={'80%'}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      >
        {sheetNames.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <span style={{ marginRight: 8 }}>选择工作表:</span>
            <Select
              value={currentSheet}
              onChange={handleSheetChange}
              style={{ width: 200 }}
              placeholder="选择工作表"
            >
              {sheetNames.map((name) => (
                <Select.Option key={name} value={name}>
                  {name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        {data.length > 0 && (
          <Table
            columns={columns}
            dataSource={tableData}
            bordered
            pagination={false}
            scroll={{ x: 'max-content' }}
            rowKey="key"
          />
        )}
      </Modal>
    </div>
  );
};

export default ExcelViewer;
