"use client";

import JSZip from "jszip";
// @ts-expect-error - jsPDF ES module doesn't have types
import { jsPDF } from "jspdf/dist/jspdf.es.min.js";
import html2canvas from "html2canvas";
import { FillState } from "@/types";

export interface AlbumArtwork {
  sketchId: string;
  title: string;
  fills: FillState;
  completedAt: string;
  thumbnailPath: string;
  isPublic?: boolean;
}

export interface AlbumConfig {
  title: string;
  artistName: string;
  artworks: AlbumArtwork[];
  format: "pdf" | "zip";
}

// Render SVG with fills to a canvas element
async function renderSketchToCanvas(
  sketchPath: string,
  fills: FillState,
  size: number = 600
): Promise<HTMLCanvasElement> {
  // Fetch SVG content
  const response = await fetch(sketchPath);
  const svgContent = await response.text();

  // Create container for rendering
  const container = document.createElement("div");
  container.innerHTML = svgContent;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.backgroundColor = "#ffffff";
  document.body.appendChild(container);

  const svg = container.querySelector("svg");
  if (!svg) {
    document.body.removeChild(container);
    throw new Error("Invalid SVG");
  }

  // Set SVG size
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.style.width = `${size}px`;
  svg.style.height = `${size}px`;

  // Apply fills
  const fillableElements = svg.querySelectorAll(
    "path, rect, circle, ellipse, polygon"
  );
  let autoIdCounter = 0;

  fillableElements.forEach((el) => {
    const element = el as SVGElement;
    let regionId = element.id;
    if (!regionId) {
      regionId = `auto-${element.tagName.toLowerCase()}-${autoIdCounter++}`;
    }
    if (fills[regionId]) {
      element.setAttribute("fill", fills[regionId]);
    }
  });

  // Apply background
  if (fills["background"]) {
    const viewBox = svg.getAttribute("viewBox");
    if (viewBox) {
      const [, , width, height] = viewBox.split(" ").map(Number);
      const bgRect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      bgRect.setAttribute("x", "0");
      bgRect.setAttribute("y", "0");
      bgRect.setAttribute("width", String(width));
      bgRect.setAttribute("height", String(height));
      bgRect.setAttribute("fill", fills["background"]);
      svg.insertBefore(bgRect, svg.firstChild);
    }
  }

  // Convert to canvas
  const canvas = await html2canvas(container, {
    backgroundColor: "#ffffff",
    scale: 2,
    logging: false,
    width: size,
    height: size,
  });

  document.body.removeChild(container);
  return canvas;
}

// Generate PNG blob from artwork
export async function renderArtworkToBlob(
  artwork: AlbumArtwork
): Promise<Blob> {
  const canvas = await renderSketchToCanvas(artwork.thumbnailPath, artwork.fills);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/png",
      1.0
    );
  });
}

// Generate ZIP with all artworks
export async function generateAlbumZip(
  config: AlbumConfig,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(config.title.replace(/[^a-zA-Z0-9 ]/g, "")) || zip;

  for (let i = 0; i < config.artworks.length; i++) {
    const artwork = config.artworks[i];
    onProgress?.(i + 1, config.artworks.length);

    try {
      const blob = await renderArtworkToBlob(artwork);
      const fileName = `${String(i + 1).padStart(2, "0")}-${artwork.title.replace(/[^a-zA-Z0-9 ]/g, "")}.png`;
      folder.file(fileName, blob);
    } catch (error) {
      console.error(`Failed to render ${artwork.title}:`, error);
    }
  }

  return zip.generateAsync({ type: "blob" });
}

// Generate designed PDF album
export async function generateAlbumPdf(
  config: AlbumConfig,
  onProgress?: (current: number, total: number, stage: string) => void
): Promise<Blob> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ==========================================
  // FRONT COVER
  // ==========================================
  onProgress?.(0, config.artworks.length + 2, "Creating front cover...");

  // Background
  pdf.setFillColor(250, 249, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative top border
  pdf.setFillColor(103, 80, 164); // Primary color
  pdf.rect(0, 0, pageWidth, 8, "F");

  // Album title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(32);
  pdf.setTextColor(28, 27, 31);
  const titleLines = pdf.splitTextToSize(config.title, contentWidth);
  pdf.text(titleLines, pageWidth / 2, 50, { align: "center" });

  // Artist name
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(16);
  pdf.setTextColor(121, 116, 126);
  pdf.text(`by ${config.artistName}`, pageWidth / 2, 70, { align: "center" });

  // Render cover thumbnails (2x2 grid)
  const coverArtworks = config.artworks.slice(0, 4);
  const thumbSize = 60;
  const thumbGap = 10;
  const gridWidth = thumbSize * 2 + thumbGap;
  const gridStartX = (pageWidth - gridWidth) / 2;
  const gridStartY = 90;

  for (let i = 0; i < coverArtworks.length; i++) {
    try {
      const canvas = await renderSketchToCanvas(
        coverArtworks[i].thumbnailPath,
        coverArtworks[i].fills,
        300
      );
      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = gridStartX + col * (thumbSize + thumbGap);
      const y = gridStartY + row * (thumbSize + thumbGap);

      // Add shadow effect (light gray rectangle behind)
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(x + 2, y + 2, thumbSize, thumbSize, 4, 4, "F");

      // Add image
      pdf.addImage(imgData, "JPEG", x, y, thumbSize, thumbSize);

      // Border
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(x, y, thumbSize, thumbSize, 4, 4, "S");
    } catch (error) {
      console.error("Failed to render cover thumbnail:", error);
    }
  }

  // Artwork count
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.setTextColor(121, 116, 126);
  pdf.text(
    `${config.artworks.length} Artworks`,
    pageWidth / 2,
    gridStartY + gridWidth + 30,
    { align: "center" }
  );

  // Date
  pdf.setFontSize(12);
  pdf.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    pageWidth / 2,
    gridStartY + gridWidth + 42,
    { align: "center" }
  );

  // Decorative bottom element
  pdf.setFillColor(103, 80, 164);
  pdf.rect(pageWidth / 2 - 20, pageHeight - 30, 40, 3, "F");

  // ==========================================
  // ARTWORK PAGES
  // ==========================================
  for (let i = 0; i < config.artworks.length; i++) {
    const artwork = config.artworks[i];
    onProgress?.(i + 1, config.artworks.length + 2, `Rendering ${artwork.title}...`);

    pdf.addPage();

    // Background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Render artwork
    try {
      const canvas = await renderSketchToCanvas(
        artwork.thumbnailPath,
        artwork.fills,
        600
      );
      const imgData = canvas.toDataURL("image/png", 1.0);

      // Calculate image dimensions (keep aspect ratio, max 150mm)
      const maxSize = 150;
      const imgX = (pageWidth - maxSize) / 2;
      const imgY = 40;

      // Shadow
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(imgX + 3, imgY + 3, maxSize, maxSize, 4, 4, "F");

      // Image
      pdf.addImage(imgData, "PNG", imgX, imgY, maxSize, maxSize);

      // Frame
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(imgX, imgY, maxSize, maxSize, 4, 4, "S");
    } catch (error) {
      console.error(`Failed to render ${artwork.title}:`, error);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(14);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Image could not be rendered", pageWidth / 2, 120, {
        align: "center",
      });
    }

    // Title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(28, 27, 31);
    pdf.text(artwork.title, pageWidth / 2, 210, { align: "center" });

    // Completion date
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(121, 116, 126);
    const completedDate = new Date(artwork.completedAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
    pdf.text(`Completed ${completedDate}`, pageWidth / 2, 220, {
      align: "center",
    });

    // Page number
    pdf.setFontSize(10);
    pdf.text(String(i + 1), pageWidth / 2, pageHeight - 15, { align: "center" });
  }

  // ==========================================
  // BACK COVER
  // ==========================================
  onProgress?.(
    config.artworks.length + 2,
    config.artworks.length + 2,
    "Finalizing..."
  );
  pdf.addPage();

  // Background
  pdf.setFillColor(250, 249, 252);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  // Decorative element
  pdf.setFillColor(103, 80, 164);
  pdf.rect(pageWidth / 2 - 25, 80, 50, 4, "F");

  // Branding
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(103, 80, 164);
  pdf.text("ColorSketch", pageWidth / 2, 120, { align: "center" });

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.setTextColor(121, 116, 126);
  pdf.text("Unleash Your Inner Artist", pageWidth / 2, 135, { align: "center" });

  // Stats
  pdf.setFontSize(12);
  pdf.text(`${config.artworks.length} Artworks`, pageWidth / 2, 160, {
    align: "center",
  });
  pdf.text(
    `Created by ${config.artistName}`,
    pageWidth / 2,
    175,
    { align: "center" }
  );
  pdf.text(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    }),
    pageWidth / 2,
    190,
    { align: "center" }
  );

  // Bottom decorative border
  pdf.setFillColor(103, 80, 164);
  pdf.rect(0, pageHeight - 8, pageWidth, 8, "F");

  return pdf.output("blob");
}

// Download helper
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
