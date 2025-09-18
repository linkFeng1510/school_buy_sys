import { useStatusActions } from "@/hooks/commonHooks";

// Define a separate component for each list item
const StatusTxt: React.FC<{ item: any, isAdmin: boolean, isProduct: boolean }> = ({ item, isAdmin = false, isProduct = false }) => {
  const { renderActionButtons } = useStatusActions(item as any, isAdmin, isProduct);
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  return (
    <div onClick={handleActionClick}>{renderActionButtons()}</div>
  );
};

export default StatusTxt;





