import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PDFCustomizationApp from "../PDFCustomizationApp";

describe("PDFCustomizationApp", () => {
  test("renders the Document Builder header", () => {
    render(<PDFCustomizationApp />);
    const headerElement = screen.getByText(/Document Builder/i);
    expect(headerElement).toBeInTheDocument();
  });

  test("renders the template selection dropdown", () => {
    render(<PDFCustomizationApp />);
    expect(screen.getByText(/Templates/i)).toBeInTheDocument();
    expect(screen.getByText(/Template 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Template 2/i)).toBeInTheDocument();
  });

  test("can select a Template", async () => {
    render(<PDFCustomizationApp />);
    const templateRadio1 = screen.getByLabelText(/Template 1/i);
    fireEvent.click(templateRadio1);
    await waitFor(() => {
      expect(templateRadio1).toBeChecked();
    });
    const templateRadio2 = screen.getByLabelText(/Template 2/i);
    fireEvent.click(templateRadio2);
    await waitFor(() => {
      expect(templateRadio2).toBeChecked();
    });
  });

  test("shows loading backdrop when generating PDF", async () => {
    render(<PDFCustomizationApp />);
    const generateBtn = screen.getByText(/Generate PDF/i);
    fireEvent.click(generateBtn);
    expect(screen.getByText(/Generating PDF.../i)).toBeInTheDocument();
  });

  test("shows reset snackbar when reset is clicked", async () => {
    render(<PDFCustomizationApp />);
    const resetBtn = screen.getByText(/Reset Form/i);
    fireEvent.click(resetBtn);
    await waitFor(() => {
      expect(screen.getByText(/Form reset successfully!/i)).toBeInTheDocument();
    });
  });

  test("shows preview placeholder when no PDF is generated", () => {
    render(<PDFCustomizationApp />);
    expect(
      screen.getByText(/Fill out the form to see live preview/i)
    ).toBeInTheDocument();
  });

  test("shows select template message when no template is selected", () => {
    render(<PDFCustomizationApp />);
    expect(screen.getByText(/Select a Template/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Choose a PDF template from the right panel/i)
    ).toBeInTheDocument();
  });
});
fireEvent.click(templateRadio2);
await waitFor(() => {
  expect(templateRadio2).toBeChecked();
});
