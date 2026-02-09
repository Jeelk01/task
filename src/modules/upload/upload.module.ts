import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadScalar } from "src/common/scalars/upload.scalar";

@Module({
     providers: [UploadService, UploadScalar],
     exports: [UploadService, UploadScalar],
})
export class UploadModule { }