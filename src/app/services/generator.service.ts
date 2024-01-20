import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  /**
   * Generate SHA-1 Signature
   * @param {string} input 
   * @returns {Promise<string>}
   */
  public async generateSHA1Signature(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const buffer = await crypto.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(buffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }
}
