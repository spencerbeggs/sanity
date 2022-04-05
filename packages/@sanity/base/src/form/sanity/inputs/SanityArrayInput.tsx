import React, {ForwardedRef, forwardRef, useCallback} from 'react'
import {SchemaType} from '@sanity/types'
import {resolveUploader as sanityResolveUploader} from '../uploads/resolveUploader'
import {ArrayInput, ArrayInputProps} from '../../inputs/arrays/ArrayOfObjectsInput'
import {
  ArrayOfPrimitivesInput,
  ArrayOfPrimitivesInputProps,
} from '../../inputs/arrays/ArrayOfPrimitivesInput'
import * as is from '../../utils/is'
import {FileLike} from '../uploads/types'
import {FormBuilderContextValue} from '../../FormBuilderContext'
import {useFormBuilder} from '../../useFormBuilder'
import {FIXME} from '../../types'
import {resolveInitialValueForType} from '../../../templates'
import {SanityArrayItemReferenceInput} from './reference/SanityArrayItemReferenceInput'

const arrayResolveUploader = (
  formBuilder: FormBuilderContextValue,
  type: SchemaType,
  file: FileLike
) => {
  const SUPPORT_DIRECT_IMAGE_UPLOADS = formBuilder.image.directUploads
  const SUPPORT_DIRECT_FILE_UPLOADS = formBuilder.file.directUploads
  if (is.type('image', type) && !SUPPORT_DIRECT_IMAGE_UPLOADS) {
    return null
  }
  if (is.type('file', type) && !SUPPORT_DIRECT_FILE_UPLOADS) {
    return null
  }
  return sanityResolveUploader(type, file)
}

export const SanityArrayInput = forwardRef(function SanityArrayInput(
  props: ArrayInputProps,
  ref: ForwardedRef<ArrayInput>
) {
  const formBuilder = useFormBuilder()

  const resolveUploader = useCallback(
    (type: SchemaType, file: FileLike) => {
      return arrayResolveUploader(formBuilder, type, file)
    },
    [formBuilder]
  )

  return (
    <ArrayInput
      {...props}
      ref={ref}
      ReferenceItemComponent={SanityArrayItemReferenceInput}
      resolveUploader={resolveUploader}
      resolveInitialValue={resolveInitialValueForType}
      ArrayFunctionsImpl={formBuilder.components.ArrayFunctions as FIXME}
    />
  )
})

export const SanityArrayOfPrimitivesInput = forwardRef(function SanityArrayOfPrimitivesInput(
  props: Omit<ArrayOfPrimitivesInputProps, 'ArrayFunctionsImpl'>,
  ref: ForwardedRef<ArrayOfPrimitivesInput>
) {
  const formBuilder = useFormBuilder()

  return (
    <ArrayOfPrimitivesInput
      {...props}
      ArrayFunctionsImpl={formBuilder.components.ArrayFunctions as FIXME}
      ref={ref}
    />
  )
})