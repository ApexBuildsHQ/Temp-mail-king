/**
 * Temp Mail King - Hybrid Decoding Engine (Unabridged Version)
 * Author: Development Team
 * Features: Professional MIME Parsing, CID Image Mapping, UTF-8 Support, 
 * Automatic Manual Fallback, Base64 & Quoted-Printable Decoding.
 */

import PostalMime from 'https://cdn.jsdelivr.net/npm/postal-mime@2.1.0/+esm';

export const EmailDecoder = {
    /**
     * Escape special characters in string for safe use inside RegExp
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    /**
     * Primary entry point: Parsers with PostalMime and falls back to manual engine if needed
     */
    async parse(rawContent) {
        if (!rawContent) return "";

        try {
            // 1. Professional Engine (PostalMime)
            const parser = new PostalMime();
            const email = await parser.parse(rawContent);
            
            if (email.html) {
                let processedHtml = email.html;

                // Process embedded inline images (CID)
                if (email.attachments && email.attachments.length > 0) {
                    email.attachments.forEach(att => {
                        if (att.contentId) {
                            const base64 = this.arrayBufferToBase64(att.content);
                            const dataUrl = `data:${att.mimeType};base64,${base64}`;
                            
                            const cidClean = att.contentId.replace(/[<>]/g, '');
                            const safeCid = this.escapeRegExp(cidClean);
                            const regex = new RegExp(`cid:${safeCid}`, 'g');
                            
                            processedHtml = processedHtml.replace(regex, dataUrl);
                        }
                    });
                }
                return processedHtml;
            }
            
            // Plain Text Fallback
            if (email.text) {
                return `<pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6;">${email.text}</pre>`;
            }
            
        } catch (error) {
            console.error("Professional Engine Error:", error);
        }

        // 2. Manual Fallback Engine
        return this.manualParse(rawContent);
    },

    /**
     * Convert ArrayBuffer to Base64 string
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Manual Engine for processing raw mail parts
     */
    manualParse(rawContent) {
        const boundaryMatch = rawContent.match(/boundary=(?:"?)([^"\s;]+)(?:"?)/i);
        
        if (boundaryMatch) {
            return this.handleMultipart(rawContent, boundaryMatch[1]);
        }

        return this.processSinglePart(rawContent);
    },

    /**
     * Handle multipart messages (HTML + Text + Images)
     */
    handleMultipart(content, boundary) {
        const parts = content.split('--' + boundary);
        let htmlContent = "";
        let plainText = "";
        const attachments = {};

        parts.forEach(part => {
            if (part.includes('Content-Type: text/html')) {
                htmlContent = this.extractBody(part);
            } 
            else if (part.includes('Content-Type: text/plain') && !htmlContent) {
                plainText = this.extractBody(part);
            } 
            else if (part.includes('Content-ID:')) {
                const cidMatch = part.match(/Content-ID:\s*<?([^>\s;]+)>?/i);
                const contentTypeMatch = part.match(/Content-Type:\s*([^;\s]+)/i);
                if (cidMatch && contentTypeMatch) {
                    const cid = cidMatch[1];
                    const base64Data = this.extractBody(part, true);
                    attachments[cid] = `data:${contentTypeMatch[1]};base64,${base64Data}`;
                }
            }
        });

        let finalResult = htmlContent || `<pre style="white-space: pre-wrap;">${plainText}</pre>`;

        // Map and replace manual inline CIDs safely
        Object.keys(attachments).forEach(cid => {
            const safeCid = this.escapeRegExp(cid);
            const regex = new RegExp(`cid:${safeCid}`, 'g');
            finalResult = finalResult.replace(regex, attachments[cid]);
        });

        return finalResult;
    },

    /**
     * Process single part messages
     */
    processSinglePart(part) {
        return this.extractBody(part);
    },

    /**
     * Extract body content and handle Transfer Encoding
     */
    extractBody(part, returnRawBase64 = false) {
        const separator = part.indexOf('\n\n');
        const header = separator !== -1 ? part.substring(0, separator) : "";
        let body = separator !== -1 ? part.substring(separator + 2).trim() : part.trim();

        body = body.replace(/--\s*$/, '');

        const encodingMatch = header.match(/Content-Transfer-Encoding:\s*([^\s;]+)/i);
        const encoding = encodingMatch ? encodingMatch[1].toLowerCase() : "";

        if (encoding === 'base64') {
            return returnRawBase64 ? body.replace(/\s+/g, '') : this.decodeBase64(body);
        } else if (encoding === 'quoted-printable') {
            return this.decodeQuotedPrintable(body);
        }

        return body;
    },

    /**
     * Decode Base64 string with full UTF-8 Support
     */
    decodeBase64(str) {
        try {
            const cleanStr = str.replace(/\s+/g, '');
            const binaryString = atob(cleanStr);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new TextDecoder('utf-8').decode(bytes);
        } catch (e) {
            console.error("Base64 Decode Error:", e);
            return str;
        }
    },

    /**
     * Decode Quoted-Printable string with full UTF-8 Support
     */
    decodeQuotedPrintable(str) {
        let decoded = str.replace(/=\r?\n/g, '');
        
        const bytes = [];
        for (let i = 0; i < decoded.length; i++) {
            if (decoded[i] === '=' && i + 2 < decoded.length) {
                const hex = decoded.substring(i + 1, i + 3);
                if (/^[0-9A-F]{2}$/i.test(hex)) {
                    bytes.push(parseInt(hex, 16));
                    i += 2;
                    continue;
                }
            }
            bytes.push(decoded.charCodeAt(i));
        }

        try {
            return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
        } catch (e) {
            return decoded;
        }
    }
};
