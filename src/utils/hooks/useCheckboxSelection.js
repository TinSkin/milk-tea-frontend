import { useState, useCallback } from "react";

export const useCheckboxSelection = (items = [], keyField = "_id", filterFn = null) => {
  const [selectedItems, setSelectedItems] = useState([]);

  // Lấy danh sách items có thể chọn (sau khi filter)
  const selectableItems = filterFn ? items.filter(filterFn) : items;
  const selectableIds = selectableItems.map(item => item[keyField]);

  //! Toggle chọn/bỏ chọn một item
  const toggleSelectItem = useCallback((itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  }, []);

  //! Toggle chọn/bỏ chọn tất cả items có thể chọn
  const toggleSelectAll = useCallback(() => {
    setSelectedItems(prev => {
      // Nếu đã chọn hết tất cả items có thể chọn -> bỏ chọn tất cả
      const selectedSelectableItems = prev.filter(id => selectableIds.includes(id));
      if (selectedSelectableItems.length === selectableIds.length) {
        return prev.filter(id => !selectableIds.includes(id)); // Giữ lại items không thể chọn
      }
      // Nếu chưa chọn hết -> chọn tất cả items có thể chọn
      return [...new Set([...prev, ...selectableIds])];
    });
  }, [selectableIds]);

  //! Chọn các items cụ thể
  const selectItems = useCallback((itemIds) => {
    setSelectedItems(prev => [...new Set([...prev, ...itemIds])]);
  }, []);


  //! Bỏ chọn các items cụ thể
  const deselectItems = useCallback((itemIds) => {
    setSelectedItems(prev => prev.filter(id => !itemIds.includes(id)));
  }, []);

  //! Xóa tất cả selections
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  //! Kiểm tra xem một item có được chọn không
  const isItemSelected = useCallback((itemId) => {
    return selectedItems.includes(itemId);
  }, [selectedItems]);

  //! Kiểm tra xem tất cả items có thể chọn đã được chọn chưa
  const isAllSelected = useCallback(() => {
    if (selectableIds.length === 0) return false;
    return selectableIds.every(id => selectedItems.includes(id));
  }, [selectedItems, selectableIds]);

  // Kiểm tra xem có ít nhất 1 item nào được chọn không
  const hasSelection = selectedItems.length > 0;

  // Số lượng items được chọn
  const selectedCount = selectedItems.length;

  // Số lượng items có thể chọn được chọn
  const selectedSelectableCount = selectedItems.filter(id => selectableIds.includes(id)).length;

  // Lấy danh sách items được chọn
  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedItems.includes(item[keyField]));
  }, [items, selectedItems, keyField]);

  return {
    // State
    selectedItems,
    selectedCount,
    selectedSelectableCount,
    hasSelection,
    
    // Methods
    toggleSelectItem,
    toggleSelectAll,
    selectItems,
    deselectItems,
    clearSelection,
    isItemSelected,
    isAllSelected,
    getSelectedItems,
    
    // Helper data
    selectableItems,
    selectableIds,
  };
};

export const useTableCheckbox = (items = [], keyField = "_id") => {
  const {
    selectedItems,
    selectedCount,
    hasSelection,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    isItemSelected,
    isAllSelected,
    getSelectedItems,
  } = useCheckboxSelection(items, keyField);

  return {
    selectedItems,
    selectedCount,
    hasSelection,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    isItemSelected,
    isAllSelected,
    getSelectedItems,
  };
};