import type { DialogueData } from '@engine/types/dialogue';
import {
  DialogueValidator,
  type DialogueValidationError,
} from '@engine/validators/DialogueValidator';

export function validateDialogue(
  dialogue: DialogueData,
  validator: DialogueValidator = new DialogueValidator(),
): DialogueValidationError[] {
  return validator.validate(dialogue);
}
