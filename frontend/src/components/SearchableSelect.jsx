import React, { useState } from "react";
import { Dropdown, Form } from "react-bootstrap";

function SearchableSelect({ options, value, onChange, placeholder, isLoading, label }) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredOptions = options?.filter(opt =>
        opt.value?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const selectedOption = options?.find(opt => String(opt.id) === String(value));

    return (
        <Dropdown className="w-100 searchable-select-dropdown" onSelect={(id) => onChange(id)}>
            <Dropdown.Toggle
                variant="white"
                className="w-100 d-flex justify-content-between align-items-center form-select shadow-none border-secondary-subtle modern-select-toggle"
                disabled={isLoading}
            >
                <span className="text-truncate me-2">
                    {selectedOption ? selectedOption.value : (isLoading ? "جارٍ التحميل..." : placeholder || "اختر...")}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu className="w-100 shadow-lg border-0 modern-dropdown-menu">
                <div className="p-2 border-bottom bg-light sticky-top" style={{ top: '-8px' }}>
                    <Form.Control
                        autoFocus
                        size="sm"
                        placeholder="ابحث هنا..."
                        className="shadow-none border-0 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
                <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <Dropdown.Item
                                key={opt.id}
                                eventKey={opt.id}
                                active={String(opt.id) === String(value)}
                                className="py-2 small"
                            >
                                {opt.value}
                            </Dropdown.Item>
                        ))
                    ) : (
                        <div className="p-3 text-center text-muted small">لا توجد نتائج</div>
                    )}
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}

export default SearchableSelect;
