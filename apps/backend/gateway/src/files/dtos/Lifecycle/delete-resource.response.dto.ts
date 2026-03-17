/**
 * Response returned after deleting a resource.
 */
export class DeleteResourceResponseDto {
  /**
   * Indicates if the deletion was successful.
   * @example true
   */
  success: boolean;

  /**
   * The ID of the deleted resource.
   * @example "resource-uuid"
   */
  id: string;
}
