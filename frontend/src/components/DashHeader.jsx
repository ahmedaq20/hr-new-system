import React from 'react'

function DashHeader({ name }) {
  return (
    <div>
      <h4 style={{ fontWeight: "bold", color: "#016A74" }}>مرحبا {name}</h4>
      {/* <h5 style={{ fontWeight: "bold", color: "#016A74" }}>رمضان كريم</h5> */}
      <p>إدارة خدماتك الوظيفية من مكان واحد</p>
    </div>
  )
}

export default DashHeader