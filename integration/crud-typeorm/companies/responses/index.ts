import { SerializeOptions } from '@ihelpee/crud';
import { GetCompanyResponseDto } from './get-company-response.dto';

export const serialize: SerializeOptions = {
  get: GetCompanyResponseDto,
};
