import { Module } from "@nestjs/common";
import { ProjectResolver } from "./project.resolver";
import { ProjectService } from "./project.service";

@Module({
     imports: [],
     providers: [ProjectResolver, ProjectService],
     exports: [ProjectService]
})
export class ProjectModule { }