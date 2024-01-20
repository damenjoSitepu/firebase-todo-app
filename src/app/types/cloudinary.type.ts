export namespace cloudinary {
  export interface UploadResult {
    access_mode: string;
    asset_id: string;
    bytes: number;
    created_at: string;
    etag: string;
    existing: boolean;
    folder: string;
    format: string;
    height: number;
    original_extension: string;
    original_filename: string;
    placeholder: boolean;
    public_id: string;
    resource_type: string;
    secure_url: string;
    signature: string;
    tags: any[];
    type: string;
    url: string;
    version: number;
    version_id: string;
    width: number;
  }
}