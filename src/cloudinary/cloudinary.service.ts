import * as path from 'path'
import * as fs from 'fs'

import { Injectable } from '@nestjs/common'
import { CloudinaryResponse } from './cloudinary-response'
import { v2 } from 'cloudinary'

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    type: 'image-avt' | 'audio' | 'image-art'
  ): Promise<CloudinaryResponse> {
    let folderPath = 'musicapp-nest/images/avatars/'

    if (type === 'image-avt') {
      folderPath = 'musicapp-nest/images/avatars/'
    } else if (type === 'image-art') {
      folderPath = 'musicapp-nest/images/artworks/'
    } else {
      folderPath = 'musicapp-nest/audios/'
    }

    try {
      const cloudFile = await v2.uploader.upload(file.path, {
        folder: folderPath,
        resource_type: 'auto'
      })
      if (cloudFile) {
        this.clearFile(file.path)
      }
      return cloudFile
    } catch (error) {
      console.log(error)
    }
  }

  async destroyFile(
    url: string,
    type: 'image-avt' | 'audio' | 'image-art'
  ): Promise<CloudinaryResponse> {
    // musicapp-nest/images/avatars/ --> path in cloudiary folder
    let publish_id: string

    if (type === 'image-avt') {
      publish_id =
        'musicapp-nest/images/avatars/' +
        url.split('musicapp-nest/images/avatars/')[1].split('.')[0]
    } else if (type === 'image-art') {
      publish_id =
        'musicapp-nest/images/artworks/' +
        url.split('musicapp-nest/images/artworks/')[1].split('.')[0]
    } else {
      publish_id = 'musicapp-nest/audios/' + url.split('musicapp-nest/audios/')[1].split('.')[0]
    }

    try {
      const response = await v2.uploader.destroy(publish_id, {
        resource_type: type === 'audio' ? 'video' : 'image'
      })
      return response
    } catch (error) {
      console.log(error)
    }
  }

  private async clearFile(filePath: string) {
    filePath = path.join(__dirname, '..', '..', '..', filePath)
    fs.unlink(filePath, err => {
      if (err) {
        console.log(err)
        console.log('hehe')
      }
    })
  }
}
