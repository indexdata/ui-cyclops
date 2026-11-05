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
* **DONE** Replace "No value selected" on Decision filter with "-" placeholder.
* **DONE** Fix "Adding to list mike_chosen from 11384075 spectres in list mike.object" message
* **DONE** Widen the ID field to accomodate larger IDs
* **DONE** Remove the unused dummy Settings pages
* **DONE** Add placeholder settings page for filters
* **DONE** Fix overlapping Action menu and Add Spectres button
* **DONE** Disable Search button when there is nothing to search for
* **DONE** Add a Reset Query button
* **DONE** Pre-validate name when creating new set from search result
* **DONE** Default search-index to "title" instead of undefined
* **DONE** Delay search-count request until search has completed
* **DONE** Action menu for bulk actions should support "Add to list"
* **DONE** Sets should be listed by human-readable title, not just by slug
* **DONE** When creating a set, allow the title to be set as well as the slug (so far as possible: CCMS itself does not yet support this)
* **DONE** Filters are now namespaced to project: hide prefixes in UI, as for sets
* **DONE** Source and destination dropdowns for spectre should use relevant lists from project.
* **DONE** Action menu for bulk actions should support "Remove from list"
* **DONE** Ability to add further index=query search fields with a "+" button
* **FIXED**: Home and Project tabs should always be clickable, even after reloading from the List tab
* **DONE** Implement settings page for maintaining filters (though only for deletion, as "edit" neither makes much sense, nor is supported on the back end).
* **DONE** Fetch filters for a given project, not all projects then filter
* **DONE** Add UI for changing the title of a set (view set, **Actions** -> **List** -> **Edit**). CCMS supports changing only the title, not the name.
* **DONE** Magical `NAME_auto` filter is automatically and dynamicalt applied to set `NAME`
* **DONE** Settings page for maintaining the set of available tracks
* **DONE** Association of tracks to individual projects
* **DONE** Ability to set track for a spectre
* **DONE** Include all three holdings sub-types in summary list of spectres in a list
* **DONE** Provide at-least/at-most filters for all three holdings sub-types
* **DONE** Add holdings subtypes to full view of a spectre
* **DONE** Internationalize the text in full spectre view and pluralize holdings counts
* **DONE** Allow set of fields in list displays to be persistently configured
* **DONE** Provide right-pane action-menu to pop up the source record

## 2026-11-04

* **DONE** Internationalize all remaining user-facing strings
* **DONE** Provide ARIA labelling for all relevant UI elements
* **DONE** Add `track` field to the spectre list
* **DONE** Consistently refer to lists by their display-name, not tag
* **DONE** Allow linking to a list (from its project) by display-name as well as tag.

## 2026-11-05

* **DONE** Refer to fund and track by display-name, not tag, in toasts.
* Refer to projects by display-name, not tag, in toasts.

## To be done

* Consistent nomenclature for Spectre/Record
* Consistent nomenclature for List/Set
* Consistent nomenclature for display-name vs. tag

