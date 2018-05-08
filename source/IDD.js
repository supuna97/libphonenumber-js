import Metadata from './metadata'
import { matches_entirely, VALID_DIGITS } from './common'

const CAPTURING_DIGIT_PATTERN = new RegExp('([' + VALID_DIGITS + '])')

/**
 * Pattern that makes it easy to distinguish whether a region has a single
 * international dialing prefix or not. If a region has a single international
 * prefix (e.g. 011 in USA), it will be represented as a string that contains
 * a sequence of ASCII digits, and possibly a tilde, which signals waiting for
 * the tone. If there are multiple available international prefixes in a
 * region, they will be represented as a regex string that always contains one
 * or more characters that are not ASCII digits or a tilde.
 */
const SINGLE_IDD_PREFIX = /[\d]+(?:[~\u2053\u223C\uFF5E][\d]+)?/

// export function isSingleIDDPrefix(IDDPrefix)
// {
// 	return matches_entirely(IDDPrefix, SINGLE_IDD_PREFIX)
// }

// For regions that have multiple international prefixes, the international format
// of the number is returned, unless there is a preferred international prefix.
export function getIDDPrefix(country, metadata)
{
	const countryMetadata = new Metadata(metadata)
	countryMetadata.country(country)

	if (matches_entirely(countryMetadata.IDDPrefix(), SINGLE_IDD_PREFIX))
	{
		return countryMetadata.IDDPrefix()
	}

	return countryMetadata.defaultIDDPrefix()
}

export function stripIDDPrefix(number, country, metadata)
{
	if (!country) {
		return
	}

	// Check if the number is IDD-prefixed.

	const IDDPrefixPattern = new RegExp(getIDDPrefix(country, metadata))

	if (number.search(IDDPrefixPattern) !== 0) {
		return
	}

	// Strip IDD prefix.
	number = number.slice(number.match(IDDPrefixPattern)[0].length)

	// Some kind of a weird edge case.
	// No explanation from Google given.
	const matchedGroups = number.match(CAPTURING_DIGIT_PATTERN)
	/* istanbul ignore next */
	if (matchedGroups && matchedGroups[1] != null && matchedGroups[1].length > 0)
	{
		if (matchedGroups[1] === '0')
		{
			return
		}
	}

	return number
}