export namespace task {
  export interface Data {
    wid: string;
    name: string;
    isCompleted: boolean;
    imageURL: string;
    imageCreatedAt: string;
    assetId: string;
    resourceType: string;
    type: string;
    publicId: string;
    signature: string;
  };

  export interface ModifiedData extends Data {
    isUpdateHandlerClicked: boolean;
    imageObj?: File | null;
  };

  export interface Request {
    name: string;
    isCompleted: boolean;
    imageURL: string;
    imageCreatedAt: string;
    assetId: string;
    resourceType: string;
    type: string;
    publicId: string;
    signature: string;
  };

  export interface FileObject {
    image: File | null;
  };
}