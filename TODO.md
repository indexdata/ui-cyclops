# CYCLOPS UI: Things To Do

* **DONE** Add ability to create a new project
* **DONE** Add ability to set Fund for a spectre
* **DONE** Add ability to delete a project
* **DONE** Add ability to set Decision for a spectre
* **DONE** Expect list of funds to now be list of struct { name, title }
* **DONE** Home page should list projects' human-readable names as well as slugs
* **DONE** Spectre view should use list of project's funds, not the complete list
* **DONE** ui-cyclops should be modified to accept {id, name} pairs from mod-cyclops
* **DONE (as far as possible)** Add editable fields for the rest of Project
* **DONE** Add ability to save searches as filters
* **DONE** Allow saved filters to be applied
* **DONE** Correctly reflect "query" resource in URL
* **DONE** Add ability to populate new lists from a specified filter
* **DONE** Hide scoping of sets to projects
* **DONE** Add settings page for managing funds (alter fund, drop fund, show fund are added)
* **DONE** Support new `holdings_count` attribute (in list view, and as a filter)
* **DONE** Show if a decision has been made on a spectre
* **DONE** Show in result list which spectres have been decided
* **DONE** Present "object" set with a better name
* **DONE** Allow filtering a list on actioned/unactioned spectres
* **DONE** Remove up/down arrows for ordering list
* **DONE** Ability to create a new set directly from search results, skipping filter creation
* **DONE** Result-list: checkboxes for bulk actions
* **DONE** Update to use new permissions from updated mod-graphql
* **FIXED**: Home and Project tabs should always be clickable, even after reloading from the List tab

From 2026-08-03 meeting:
* UI only
  * **DONE** Replace "No value selected" on Decision filter with "-" placeholder.
  * **DONE** Fix "Adding to list mike_chosen from 11384075 spectres in list mike.object" message
  * **DONE** Widen the ID field to accomodate larger IDs
  * **DONE** Remove the unused dummy Settings pages
  * **DONE** Add placeholder settings page for filters
  * Add a Reset Query button
  * Fix overlapping Action menu and Add Spectres button
  * Action menu for bulk actions should support "Add to list"
  * Action menu for bulk actions should support "Remove from list"
  * Ability to add further index=query search fields with a "+" button
  * Consider magical "auto.NAME" filter automatically applied to set "NAME"
* Requiring new backend work
  * When creating a set, allow the title to be set as well as the slug
  * Sets should be listed by human-readable title, not just by slug
  * Implement settings page for maintaining filters (if only for deletion)
  * Filters are now namespaced to project: hide prefixes in UI, as for sets
  * CONSIDER switching to submitting CQL, and having mod-cyclops do the translation

