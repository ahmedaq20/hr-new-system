import Select, { Props as SelectProps, GroupBase, StylesConfig } from 'react-select';

interface Option {
  value: string | number;
  label: string;
}

interface CSelectProps extends Omit<SelectProps<Option, boolean, GroupBase<Option>>, 'theme'> {
  label?: string;
}

const customStyles: StylesConfig<Option, boolean, GroupBase<Option>> = {
  control: (provided, state) => ({
      ...provided,
      borderRadius: '8px',
      borderColor: state.isFocused ? '#002F6C' : '#dee2e6',
      boxShadow: state.isFocused ? '0 0 0 0.2rem rgba(0, 47, 108, 0.25)' : 'none',
      '&:hover': {
        borderColor: '#002F6C',
      },
      fontSize: '14px',
      minHeight: '38px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#002F6C' : state.isFocused ? 'rgba(0, 47, 108, 0.1)' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      '&:active': {
        backgroundColor: '#002F6C',
      },
      fontSize: '14px',
      cursor: 'pointer',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(0, 47, 108, 0.1)',
      borderRadius: '4px',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#002F6C',
      fontSize: '12px',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#002F6C',
      '&:hover': {
        backgroundColor: '#002F6C',
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#adb5bd',
      fontSize: '14px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

const CSelect = ({ label, ...props }: CSelectProps) => {
  return (
    <div>
      {label && <label className="form-label" style={{ fontSize: '14px', fontWeight: '500' }}>{label}</label>}
      <Select
        {...props}
        styles={customStyles}
        placeholder={props.placeholder || "اختر..."}
        noOptionsMessage={() => "لا توجد نتائج"}
        menuPortalTarget={props.menuPortalTarget || (typeof document !== 'undefined' ? document.body : null)}
        menuPosition={props.menuPosition || "fixed"}
        menuPlacement={props.menuPlacement || "bottom"}
      />
    </div>
  );
};

export default CSelect;
