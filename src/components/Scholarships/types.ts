import type { Scholarship } from '@/payload-types'

type PageBlocks = Exclude<Scholarship['pageBlocks'], null | undefined>
type PageBlock = PageBlocks[number]

export type ScholarshipSectionBlock = Extract<PageBlock, { blockType: 'scholarship-section' }>

export interface AccommodationBlock {
  accommodationTitle: Scholarship['accommodationTitle']
  accommodationContent: Scholarship['accommodationContent']
  accommodationImage: Scholarship['accommodationImage']
  accommodationFacilitiesTitle: Scholarship['accommodationFacilitiesTitle']
  accommodationFacilitiesImage: Scholarship['accommodationFacilitiesImage']
}
