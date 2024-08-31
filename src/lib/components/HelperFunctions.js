// markdownToPdfStyling.js
// @ts-nocheck
import { marked } from 'marked';

export function applyMarkdownStyling(pdf, content) {
	const pageWidth = pdf.internal.pageSize.width;
	const pageHeight = pdf.internal.pageSize.height;
	const margin = 40;
	let y = margin;

	// Set consistent font sizes and styles
	const titleFontSize = 24;
	const heading1FontSize = 20;
	const heading2FontSize = 16;
	const heading3FontSize = 14;
	const bodyFontSize = 12;
	const lineHeight = 1.5;

	// Parse the markdown content
	const parsedContent = marked.lexer(content);
    console.log(parsedContent)
	parsedContent.forEach((token) => {
		switch (token.type) {
			case 'heading':
				y = handleHeading(pdf, token, y, pageWidth, pageHeight, margin, {
					titleFontSize,
					heading1FontSize,
					heading2FontSize,
					heading3FontSize,
					lineHeight
				});
				break;
			case 'paragraph':
				y = handleParagraph(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight);
				break;
			case 'list':
				y = handleList(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight);
				break;
			case 'code':
				y = handleCode(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight);
				break;
			case 'blockquote':
				y = handleBlockquote(
					pdf,
					token,
					y,
					pageWidth,
					pageHeight,
					margin,
					bodyFontSize,
					lineHeight
				);
				break;
            case 'hr':
                y = handleHorizontalRule(pdf, y, pageWidth, margin);
                break;
		}
	});

	return y; // Return the final y position
}

function handleHeading(pdf, token, y, pageWidth, pageHeight, margin, fontSizes) {
	const { titleFontSize, heading1FontSize, heading2FontSize, heading3FontSize, lineHeight } =
		fontSizes;

	if (y > pageHeight - margin) {
		pdf.addPage();
		y = margin;
	}

	pdf.setFont(undefined, 'bold');
	let fontSize;
	switch (token.depth) {
		case 1:
			fontSize = titleFontSize;
			break;
		case 2:
			fontSize = heading1FontSize;
			break;
		case 3:
			fontSize = heading2FontSize;
			break;
		default:
			fontSize = heading3FontSize;
	}

	pdf.setFontSize(fontSize);
	pdf.text(token.text, margin, y);
	y += fontSize * 0.5;

	if (token.depth <= 2) {
		pdf.setDrawColor(234, 236, 239); // #eaecef
		pdf.line(margin, y, pageWidth - margin, y);
	}

    y += 30;

	return y;
}

function handleParagraph(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight) {
    pdf.setFontSize(bodyFontSize);
    pdf.setFont(undefined, 'normal');
    
    let currentX = margin;
    const maxWidth = pageWidth - 2 * margin;
  
    function renderText(text, style = {}) {
      const words = text.split(' ');
      words.forEach((word, index) => {
        const wordWidth = pdf.getTextWidth(word + (index < words.length - 1 ? ' ' : ''));
        
        if (currentX + wordWidth > pageWidth - margin) {
          y += bodyFontSize * lineHeight;
          currentX = margin;
        }
  
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
  
        if (style.bold) pdf.setFont(undefined, 'bold');
        if (style.italic) pdf.setFont(undefined, 'italic');
        if (style.code) {
          pdf.setFont('Courier', 'normal');
          pdf.setFillColor(240, 240, 240);
          pdf.rect(currentX - 1, y - bodyFontSize + 2, wordWidth + 2, bodyFontSize + 2, 'F');
        }
        if (style.link) pdf.setTextColor(0, 0, 255);
  
        pdf.text(word, currentX, y);
  
        if (style.link) {
          pdf.link(currentX, y - bodyFontSize, wordWidth, bodyFontSize, { url: style.link });
        }
  
        currentX += wordWidth;
  
        // Reset styles
        pdf.setFont(undefined, 'normal');
        pdf.setFillColor(255, 255, 255);
        pdf.setTextColor(0);
      });
    }
  
    function processTokens(tokens) {
      tokens.forEach(token => {
        switch (token.type) {
          case 'text':
            renderText(token.text);
            break;
          case 'strong':
            renderText(token.text, { bold: true });
            break;
          case 'em':
            renderText(token.text, { italic: true });
            break;
          case 'code':
            renderText(token.text, { code: true });
            break;
          case 'link':
            renderText(token.text, { link: token.href });
            break;
          case 'image':
            // Handle images if needed
            break;
          default:
            if (typeof token === 'string') {
              renderText(token);
            } else if (token.tokens) {
              processTokens(token.tokens);
            }
        }
      });
    }
  
    if (Array.isArray(token.tokens)) {
      processTokens(token.tokens);
    } else {
      renderText(token.text);
    }
  
    y += bodyFontSize * lineHeight;

    y += 10; // Change Later

    return y;
  }

function handleList(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight) {
	pdf.setFontSize(bodyFontSize);
	pdf.setFont(undefined, 'normal');
	token.items.forEach((item, index) => {
		const bullet = token.ordered ? `${index + 1}.` : '•';
		const itemText = `${bullet} ${item.text}`;
		const lines = pdf.splitTextToSize(itemText, pageWidth - 2 * margin - 10);
		lines.forEach((line, lineIndex) => {
			if (y > pageHeight - margin) {
				pdf.addPage();
				y = margin;
			}
			pdf.text(line, lineIndex === 0 ? margin : margin + 10, y);
			y += bodyFontSize * lineHeight;
		});
	});
	y += 10; // Add some space after lists
	return y;
}

function handleCode(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight) {
	pdf.setFontSize(bodyFontSize * 0.85);
	pdf.setFont('Courier', 'normal');
	pdf.setFillColor(246, 248, 250); // #f6f8fa
	const codeLines = token.text.split('\n');
	const codeBlockHeight = codeLines.length * bodyFontSize * lineHeight + 32;
	if (y + codeBlockHeight > pageHeight - margin) {
		pdf.addPage();
		y = margin;
	}
	pdf.rect(margin, y, pageWidth - 2 * margin, codeBlockHeight, 'F');
	y += 16;
	codeLines.forEach((line) => {
		pdf.text(line, margin + 16, y);
		y += bodyFontSize * lineHeight;
	});
	y += 16;
	pdf.setFont(undefined, 'normal');
	pdf.setFillColor(0, 0, 0);
	return y;
}

function handleBlockquote(pdf, token, y, pageWidth, pageHeight, margin, bodyFontSize, lineHeight) {
	pdf.setFillColor(240, 240, 240);
	pdf.rect(margin, y, 5, bodyFontSize * lineHeight, 'F');
	pdf.setFillColor(255, 255, 255);

	pdf.setFont(undefined, 'italic');
	const lines = pdf.splitTextToSize(token.text, pageWidth - 2 * margin - 20);
	lines.forEach((line) => {
		if (y > pageHeight - margin) {
			pdf.addPage();
			y = margin;
		}
		pdf.text(line, margin + 15, y);
		y += bodyFontSize * lineHeight;
	});
	pdf.setFont(undefined, 'normal');
	y += 10;
	return y;
}

function handleHorizontalRule(pdf, y, pageWidth, margin, gapBefore = 10, gapAfter = 20) {
    // Add space before the line
    // y += gapBefore;

    // Draw the line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5); // Set a thin line width
    pdf.line(margin, y, pageWidth - margin, y);

    // Add space after the line
    y += gapAfter;

    return y;
}
