"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Mail, Plus } from "lucide-react";

interface Company {
  id: number;
  name: string;
  address: string;
  city: string;
  vat: string;
  plan: string;
  planPrice: number;
  licensedUsers: number;
  usedUsers: number;
  apiUsage: number;
  apiLimit: number;
  apiOverageCost: number;
}

const Invoice = () => {
  // ===== FAKE COMPANY DATA =====
  const companies: Company[] = [
    {
      id: 1,
      name: "TechCorp Inc.",
      address: "456 Corporate Blvd",
      city: "New York, NY 10001",
      vat: "GB987654321",
      plan: "Business Plan",
      planPrice: 299,
      licensedUsers: 10,
      usedUsers: 15,
      apiUsage: 18000,
      apiLimit: 15000,
      apiOverageCost: 0.02,
    },
    {
      id: 2,
      name: "Pixel Dynamics Ltd.",
      address: "22 Silicon Street",
      city: "London, UK",
      vat: "GB223344556",
      plan: "Premium Plan",
      planPrice: 499,
      licensedUsers: 25,
      usedUsers: 28,
      apiUsage: 25000,
      apiLimit: 20000,
      apiOverageCost: 0.03,
    },
    {
      id: 3,
      name: "DataWorks Solutions",
      address: "789 Market Ave",
      city: "Toronto, Canada",
      vat: "CA998877665",
      plan: "Basic Plan",
      planPrice: 199,
      licensedUsers: 5,
      usedUsers: 7,
      apiUsage: 9000,
      apiLimit: 8000,
      apiOverageCost: 0.01,
    },
  ];

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [invoice, setInvoice] = useState<any>(null);

  // ===== GENERATE INVOICE =====
  const handleCreateInvoice = () => {
    if (!selectedCompany) return alert("Please select a company first!");

    const randomInvoiceId = `INV-${Math.floor(Math.random() * 9000 + 1000)}`;
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 30);

    // Calculate extra users and API overage
    const extraUsers =
      selectedCompany.usedUsers > selectedCompany.licensedUsers
        ? selectedCompany.usedUsers - selectedCompany.licensedUsers
        : 0;

    const apiOverage =
      selectedCompany.apiUsage > selectedCompany.apiLimit
        ? selectedCompany.apiUsage - selectedCompany.apiLimit
        : 0;

    const userLicenseCost = 10; // $ per extra user

    // Build invoice line items dynamically
    const items = [
      {
        description: `${selectedCompany.plan} Subscription (Nov 2025)`,
        qty: 1,
        price: selectedCompany.planPrice,
      },
    ];

    if (extraUsers > 0) {
      items.push({
        description: `Additional User Licenses (${extraUsers} users)`,
        qty: extraUsers,
        price: userLicenseCost,
      });
    }

    if (apiOverage > 0) {
      const overageCost = selectedCompany.apiOverageCost;
      items.push({
        description: `API Usage Overage (${apiOverage.toLocaleString()} calls)`,
        qty: apiOverage,
        price: overageCost,
      });
    }

    setInvoice({
      invoiceNo: randomInvoiceId,
      date: today.toLocaleDateString(),
      dueDate: due.toLocaleDateString(),
      company: selectedCompany,
      items,
    });
  };

  // ===== CALCULATE TOTALS =====
  const subtotal =
    invoice?.items?.reduce((acc: number, item: any) => acc + item.qty * item.price, 0) || 0;
  const vat = subtotal * 0.2;
  const total = subtotal + vat;

  // ===== PDF DOWNLOAD =====
  const handleDownloadPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("INVOICE", 14, 20);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNo}`, 14, 28);
    doc.text(`Date: ${invoice.date}`, 14, 33);
    doc.text(`Due Date: ${invoice.dueDate}`, 14, 38);

    // FROM / TO
    doc.text("From:", 14, 50);
    doc.text("YourCompany Inc.", 14, 55);
    doc.text("123 Business Ave", 14, 60);
    doc.text("San Francisco, CA 94107", 14, 65);
    doc.text("VAT: GB123456789", 14, 70);

    doc.text("To:", 120, 50);
    doc.text(invoice.company.name, 120, 55);
    doc.text(invoice.company.address, 120, 60);
    doc.text(invoice.company.city, 120, 65);
    doc.text(`VAT: ${invoice.company.vat}`, 120, 70);

    autoTable(doc, {
      startY: 80,
      head: [["Description", "Qty", "Unit Price", "Amount"]],
      body: invoice.items.map((item: any) => [
        item.description,
        item.qty,
        `$${item.price}`,
        `$${(item.qty * item.price).toFixed(2)}`,
      ]),
    });

    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 10);
    doc.text(`VAT (20%): $${vat.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 15);
    doc.text(`Total: $${total.toFixed(2)}`, 150, doc.lastAutoTable.finalY + 20);

    doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h2 className="text-lg font-semibold mb-6">Admin control center</h2>

      <div className="bg-[#272727]  p-6 rounded-lg shadow-lg">
        <h3 className="font-semibold text-gray-200 mb-2">Payments & Reports Management</h3>
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-400">Automatic Invoice Generation</p>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>

        {/* Company Selector */}
        <select
          value={selectedCompany?.id || ""}
          onChange={(e) =>
            setSelectedCompany(
              companies.find((c) => c.id === Number(e.target.value)) || null
            )
          }
          className="bg-gray-700 w-full p-2 rounded-md mb-6 text-sm"
        >
          <option value="">Select Company</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Display invoice */}
        {invoice && (
          <div className="bg-black/30 p-6 rounded-xl mt-6 border border-gray-700">
            <div className="flex justify-between mb-4">
              <div>
                <h4 className="font-semibold text-lg">{invoice.company.name}</h4>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">
                  Invoice #: <span className="text-white">{invoice.invoiceNo}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Date: <span className="text-white">{invoice.date}</span>
                </p>
                <p className="text-gray-400 text-sm">
                  Due Date: <span className="text-white">{invoice.dueDate}</span>
                </p>
              </div>
            </div>

            {/* From / To */}
            <div className="flex justify-between text-sm mb-5">
              <div>
                <p className="text-gray-400">From:</p>
                <p>YourCompany Inc.</p>
                <p>123 Business Ave</p>
                <p>San Francisco, CA 94107</p>
                <p>VAT: GB123456789</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400">To:</p>
                <p>{invoice.company.name}</p>
                <p>{invoice.company.address}</p>
                <p>{invoice.company.city}</p>
                <p>VAT: {invoice.company.vat}</p>
              </div>
            </div>

            {/* Line items */}
            <table className="w-full text-sm text-left border-t border-gray-700">
              <thead className="text-gray-400">
                <tr>
                  <th className="py-2">Description</th>
                  <th className="py-2">Quantity</th>
                  <th className="py-2">Unit Price</th>
                  <th className="py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, i: number) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">{item.qty}</td>
                    <td className="py-2">${item.price.toFixed(2)}</td>
                    <td className="py-2">${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right mt-4 text-sm">
              <p>Subtotal: ${subtotal.toFixed(2)}</p>
              <p>VAT (20%): ${vat.toFixed(2)}</p>
              <p className="font-semibold mt-2">Total: ${total.toFixed(2)}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
              <button className="bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email to Client
              </button>
     
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
