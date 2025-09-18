import { useStatusActions } from "@/hooks/commonHooks";

// Define a separate component for each list item
const StatusTxt: React.FC<{ item: any, isAdmin: boolean, isProduct: boolean }> = ({ item, isAdmin = false, isProduct = false }) => {
  const { renderStatusTag } = useStatusActions(item as any, isAdmin, isProduct);

  return (
      <div >{renderStatusTag()}</div>
  );
};

export default StatusTxt;
