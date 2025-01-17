import {type CurrentUser} from '@sanity/types'
import {Box, Card, Flex, MenuDivider, Stack} from '@sanity/ui'
// eslint-disable-next-line camelcase
import {getTheme_v2} from '@sanity/ui/theme'
import {useCallback} from 'react'
import {useTranslation, useUser} from 'sanity'
import styled, {css} from 'styled-components'

import {Button, TooltipDelayGroupProvider} from '../../../../../../ui-components'
import {commentsLocaleNamespace} from '../../../../i18n'
import {CommentsAvatar} from '../../avatars/CommentsAvatar'
import {MentionIcon, SendIcon} from '../../icons'
import {Editable} from './Editable'
import {useCommentInput} from './useCommentInput'

const EditableWrap = styled(Box)`
  max-height: 20vh;
  overflow-y: auto;
`

const ButtonDivider = styled(MenuDivider)({
  height: 20,
  width: 1,
})

function focusRingBorderStyle(border: {color: string; width: number}): string {
  return `inset 0 0 0 ${border.width}px ${border.color}`
}

const RootCard = styled(Card)(({theme}) => {
  const {color, input, radius} = getTheme_v2(theme)
  const radii = radius[2]

  return css`
    border-radius: ${radii}px;
    box-shadow: var(--input-box-shadow);

    --input-box-shadow: inset 0 0 0 ${input.border.width}px ${color.input.default.enabled.border};

    &:not([data-expand-on-focus='false'], :focus-within) {
      background: transparent;
      box-shadow: unset;
    }

    &[data-focused='true']:focus-within {
      ${EditableWrap} {
        min-height: 1em;
      }
      --input-box-shadow: inset 0 0 0 ${input.border.width}px var(--card-focus-ring-color);
    }

    &:focus-within {
      ${EditableWrap} {
        min-height: 1em;
      }
    }

    &[data-expand-on-focus='false'] {
      ${EditableWrap} {
        min-height: 1em;
      }
    }

    &[data-expand-on-focus='true'] {
      [data-ui='CommentInputActions']:not([hidden]) {
        display: none;
      }

      &:focus-within {
        [data-ui='CommentInputActions'] {
          display: flex;
        }
      }
    }
    &:hover {
      --input-box-shadow: ${focusRingBorderStyle({
        color: color.input.default.hovered.border,
        width: input.border.width,
      })};
    }
  `
})

interface CommentInputInnerProps {
  currentUser: CurrentUser
  focusLock?: boolean
  onBlur?: (e: React.FormEvent<HTMLDivElement>) => void
  onFocus?: (e: React.FormEvent<HTMLDivElement>) => void
  onKeyDown?: (e: React.KeyboardEvent<Element>) => void
  onSubmit?: () => void
  placeholder?: React.ReactNode
  withAvatar?: boolean
}

export function CommentInputInner(props: CommentInputInnerProps) {
  const {currentUser, focusLock, onBlur, onFocus, onKeyDown, onSubmit, placeholder, withAvatar} =
    props

  const [user] = useUser(currentUser.id)
  const {canSubmit, expandOnFocus, focused, hasChanges, insertAtChar, openMentions, readOnly} =
    useCommentInput()

  const {t} = useTranslation(commentsLocaleNamespace)
  const avatar = withAvatar ? <CommentsAvatar user={user} /> : null

  const handleMentionButtonClicked = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      insertAtChar()
      openMentions()
    },
    [insertAtChar, openMentions],
  )

  return (
    <Flex align="flex-start" gap={2}>
      {avatar}

      <RootCard
        data-expand-on-focus={expandOnFocus && !canSubmit ? 'true' : 'false'}
        data-focused={focused ? 'true' : 'false'}
        flex={1}
        sizing="border"
        tone={readOnly ? 'transparent' : 'default'}
      >
        <Stack>
          <EditableWrap paddingX={1} paddingY={2} sizing="border" data-ui="editable-wrap">
            <Editable
              focusLock={focusLock}
              onBlur={onBlur}
              onFocus={onFocus}
              onKeyDown={onKeyDown}
              onSubmit={onSubmit}
              placeholder={placeholder}
            />
          </EditableWrap>

          <Flex align="center" data-ui="CommentInputActions" gap={1} justify="flex-end" padding={1}>
            <TooltipDelayGroupProvider>
              <Button
                aria-label={t('compose.mention-user-aria-label')}
                data-testid="comment-input-mention-button"
                disabled={readOnly}
                icon={MentionIcon}
                mode="bleed"
                type="button"
                onClick={handleMentionButtonClicked}
                tooltipProps={{content: t('compose.mention-user-tooltip')}}
              />
              {onSubmit && (
                <>
                  <ButtonDivider />

                  <Button
                    aria-label={t('compose.send-comment-aria-label')}
                    data-testid="comment-input-send-button"
                    disabled={!canSubmit || !hasChanges || readOnly}
                    icon={SendIcon}
                    mode={hasChanges && canSubmit ? 'default' : 'bleed'}
                    onClick={onSubmit}
                    tone={hasChanges && canSubmit ? 'primary' : 'default'}
                    tooltipProps={{content: t('compose.send-comment-tooltip')}}
                  />
                </>
              )}
            </TooltipDelayGroupProvider>
          </Flex>
        </Stack>
      </RootCard>
    </Flex>
  )
}
