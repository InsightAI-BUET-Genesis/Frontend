<script>
	// @ts-nocheck
	// @ts-nocheck
	import { onMount } from 'svelte';
	import jsPDF from 'jspdf';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	export let note;
	export let metadata;

	let downloadPDF;

	onMount(() => {
		downloadPDF = () => {
			const doc = new jsPDF();

			const pageWidth = doc.internal.pageSize.width;
			const pageHeight = doc.internal.pageSize.height;
			const marginTop = 40;
			const marginBottom = 40;
			const maxY = pageHeight - marginBottom;

			// Add header and footer
			const addHeaderAndFooter = (pageNum) => {
				// Header
				doc.setFont('helvetica', 'italic');
				doc.setFontSize(10);
				doc.setTextColor(100, 100, 100);
				doc.text(metadata.title, pageWidth / 2, 15, { align: 'center' });

				// Footer
				doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

				// Reset font settings after header to avoid affecting content
				doc.setFont('times', 'normal');
				doc.setFontSize(16);
				doc.setTextColor(0, 0, 0);
			};

			const addContent = (content, startY) => {
				let y = startY;

				const html = DOMPurify.sanitize(
					marked(content, {
						highlight: function (code, lang) {
							return code; // You can add syntax highlighting here if needed
						}
					})
				);
				const div = document.createElement('div');
				div.innerHTML = html;

				const checkPageBreak = (additionalHeight) => {
					if (y + additionalHeight > maxY) {
						addHeaderAndFooter(doc.internal.getNumberOfPages());
						doc.addPage();
						y = marginTop;
					}
				};

				const processNode = (node) => {
					let heightToAdd = 0;
					console.log(node.tagName, node.textContent);
					if (node.nodeType === Node.ELEMENT_NODE) {
						switch (node.tagName.toLowerCase()) {
							case 'h1':
								doc.setFontSize(24);
								doc.setFont('helvetica', 'bold');
								doc.setTextColor(0, 51, 102);
								heightToAdd = 15 + doc.getTextDimensions(node.textContent).h;
								checkPageBreak(heightToAdd);
								y = addText(node.textContent, 20, y, 170);
								doc.setLineWidth(0.5);
								doc.line(20, y + 2, 190, y + 2);
								y += 10;
								break;
							case 'h2':
								doc.setFontSize(22);
								doc.setFont('helvetica', 'bold');
								doc.setTextColor(0, 102, 204);
								heightToAdd = 12 + doc.getTextDimensions(node.textContent).h;
								checkPageBreak(heightToAdd);
								y = addText(node.textContent, 20, y, 170);
								y += 8;
								break;
							case 'h3':
								doc.setFontSize(20);
								doc.setFont('helvetica', 'bold');
								doc.setTextColor(51, 153, 255);
								heightToAdd = 10 + doc.getTextDimensions(node.textContent).h;
								checkPageBreak(heightToAdd);
								y = addText(node.textContent, 20, y, 170);
								y += 6;
								break;
							case 'p':
								doc.setFontSize(16);
								doc.setFont('times', 'normal');
								doc.setTextColor(0, 0, 0);
								heightToAdd = 10 + doc.getTextDimensions(node.textContent).h;
								checkPageBreak(heightToAdd);
								y = addText(node.textContent, 20, y, 170);
								y += 8;
								break;
							case 'ul':
								doc.setFontSize(16);
								doc.setFont('times', 'normal');
								doc.setTextColor(0, 0, 0);
								const listItems = Array.from(node.children);
								heightToAdd = listItems.length * 10;
								checkPageBreak(heightToAdd);
								listItems.forEach((li) => {
									y = addText(`• ${li.textContent}`, 25, y, 165);
									y += 6;
								});
								break;
							case 'ol':
								// Handle <ol> elements
								doc.setFontSize(16);
								doc.setFont('times', 'normal');
								doc.setTextColor(0, 0, 0);
								const orderedListItems = Array.from(node.children);
								orderedListItems.forEach((li, index) => {
									y = addText(`${index + 1}.`, 20, y, 165);
									Array.from(li.childNodes).forEach((childNode) => {
										if (childNode.tagName && childNode.tagName.toLowerCase() === 'pre') {
											// Handle <pre> inside <ol>
											doc.setFontSize(14);
											doc.setFont('courier', 'normal');
											doc.setTextColor(0, 0, 0);
											const code = childNode.textContent;
											const codeLines = doc.splitTextToSize(code, 160);
											heightToAdd = codeLines.length * 6 + 15;
											checkPageBreak(heightToAdd);
											doc.setFillColor(240, 248, 255);
											doc.rect(25, y - 10, 165, codeLines.length * 6 + 3, 'F');
											codeLines.forEach((line) => {
												doc.text(line, 30, y);
												y += 5;
											});
											doc.setFillColor(0, 0, 0);
											y += 8;
										} else {
											// Handle regular text nodes in <ol>
											doc.setFontSize(16);
											doc.setFont('times', 'normal');
											doc.setTextColor(0, 0, 0);
											heightToAdd = 10 + doc.getTextDimensions(childNode.textContent).h;
											checkPageBreak(heightToAdd);
											y = addText(childNode.textContent, 30, y, 165);
											y += 8;
										}
									});
								});
								break;
							case 'pre':
								doc.setFontSize(14);
								doc.setFont('courier', 'normal');
								doc.setTextColor(0, 0, 0);
								const code = node.textContent;
								const codeLines = doc.splitTextToSize(code, 160);
								heightToAdd = codeLines.length * 6 + 15;
								checkPageBreak(heightToAdd);
								doc.setFillColor(240, 248, 255);
								doc.rect(15, y - 8, 180, codeLines.length * 6 + 3, 'F');
								codeLines.forEach((line) => {
									doc.text(line, 20, y);
									y += 5;
								});
								doc.setFillColor(0, 0, 0);
								y += 12;
								break;
							default:
								doc.setFontSize(16);
								doc.setFont('times', 'normal');
								doc.setTextColor(0, 0, 0);
								heightToAdd = 10 + doc.getTextDimensions(node.textContent).h;
								checkPageBreak(heightToAdd);
								y = addText(node.textContent, 20, y, 170);
								y += 8;
						}
					} else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '') {
						doc.setFontSize(16);
						doc.setFont('times', 'normal');
						doc.setTextColor(0, 0, 0);
						heightToAdd = 10 + doc.getTextDimensions(node.textContent).h;
						checkPageBreak(heightToAdd);
						y = addText(node.textContent, 20, y, 170);
						y += 8;
					}
				};

				Array.from(div.childNodes).forEach(processNode);

				return y;
			};

			const addText = (text, x, y, maxWidth) => {
				const lines = doc.splitTextToSize(text, maxWidth);
				doc.text(lines, x, y);
				return y + lines.length * 7;
			};

			// Title and metadata
			let y = addContent(
				`# ${metadata.title}\n\nTopic: ${metadata.topic}\nKnowledge Level: ${metadata.knowledgeLevel}\n\n`,
				marginTop
			);

			// Introduction
			y = addContent(`## Introduction\n\n${note.introduction_and_motivation}\n\n`, y);

			// Slides
			note.slides.forEach((slide, index) => {
				doc.addPage();
				y = marginTop;
				y = addContent(
					`## Slide ${index + 1}: ${slide.slide_name}\n\n${slide.slide_content}\n\n`,
					y
				);
			});

			// Questions
			note.questions.forEach((q, index) => {
				doc.addPage(); // Add a new page for each question
				y = marginTop; // Reset the y position to the top margin
				y = addContent(`## Question ${index + 1}\n\n**Q: ${q.question}**\n\n${q.answer}\n\n`, y);
			});

			// Conclusion
			doc.addPage(); // Add a new page for the conclusion
			y = marginTop; // Reset the y position to the top margin
			y = addContent(`## Conclusion\n\n${note.conclusion}`, y);


			// Add header and footer to all pages
			for (let i = 1; i <= doc.internal.getNumberOfPages(); i++) {
				doc.setPage(i);
				addHeaderAndFooter(i);
			}

			// Save the PDF
			doc.save(`${metadata.title}.pdf`);
		};
	});
</script>

<button
	on:click={downloadPDF}
	class="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
>
	Download PDF
</button>
