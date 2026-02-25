import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/index.js';
import { SearchService } from './search.service.js';

class FaceSearchDto {
    eventId?: string;
    lgpdConsent!: boolean;
}

@ApiTags('Search')
@Controller('search')
export class SearchController {
    constructor(private searchService: SearchService) { }

    @Public()
    @Post('face')
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Busca facial — envia selfie e recebe fotos com match score',
    })
    @UseInterceptors(FileInterceptor('selfie'))
    async searchByFace(
        @UploadedFile() _file: Express.Multer.File,
        @Body() body: FaceSearchDto,
    ) {
        // LGPD consent check
        if (!body.lgpdConsent) {
            throw new BadRequestException(
                'Consentimento LGPD é obrigatório para busca facial',
            );
        }

        // MVP: file is NOT stored — used only transiently
        // In production, file would be sent to AWS Rekognition SearchFacesByImage
        return this.searchService.searchByFace(body.eventId);
    }
}
