export const ASSET_FIELDS = [
  { key: 'assetTag',      label: 'Asset Tag',      type: 'text',   required: true },
  { key: 'name',          label: 'Asset Name',      type: 'text',   required: true },
  { key: 'type',          label: 'Category',        type: 'select', required: true,
    options: ['Medical Equipment', 'IT Equipment', 'Furniture', 'Facilities', 'Vehicle', 'Other'] },
  { key: 'manufacturer',  label: 'Manufacturer',    type: 'text' },
  { key: 'model',         label: 'Model',           type: 'text' },
  { key: 'serialNumber',  label: 'Serial Number',   type: 'text' },
  { key: 'location',      label: 'Location',        type: 'text',   required: true },
  { key: 'department',    label: 'Department',      type: 'text',   required: true },
  { key: 'status',        label: 'Status',          type: 'select', required: true,
    options: ['In Use', 'Available', 'Under Maintenance', 'Retired'] },
  { key: 'assignedTo',    label: 'Assigned To',     type: 'text' },
  { key: 'purchaseDate',  label: 'Purchase Date',   type: 'date' },
  { key: 'warrantyExpiry',label: 'Warranty Expiry', type: 'date' },
];

export const TYPE_OPTIONS    = ['Medical Equipment', 'IT Equipment', 'Furniture', 'Facilities', 'Vehicle', 'Other'];
export const STATUS_OPTIONS  = ['In Use', 'Available', 'Under Maintenance', 'Retired'];
