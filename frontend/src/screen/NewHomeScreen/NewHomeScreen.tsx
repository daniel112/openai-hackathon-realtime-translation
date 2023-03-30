import { Center, HStack, Spacer, Text, VStack, Image, Button } from '@chakra-ui/react'
import './NewHomeScreen.css'
import img from "../../img/bablefish2.png"
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { useNavigate } from 'react-router-dom'

export const NewHomeScreen = () => {
	const navigate = useNavigate()

	return (
		<div>
			<HStack h={'180'}></HStack>
			<HStack h={'340'} align={'center'} justifyContent={'center'}>
				<Image src={img} boxSize={600} objectFit="contain" />
				<VStack w={600}>
					<Text mb={'-12'} fontSize={'9xl'} justifyContent={'start'}>Babel Fish</Text>
					<Text mr={'20'}>Instant speech to text translation in any language using AI.</Text>
					<HStack>
						<Button onClick={() => navigate("/record")} colorScheme={"blue"} rightIcon={<ArrowForwardIcon />}>Start Translation</Button>

					</HStack>
				</VStack>
			</HStack>

			<Center>
				<HStack
					position={'absolute'}
					bottom={30}
					h={'10'}
				>
					<VStack>
						<Text zIndex={1}>© Neudesic 2023</Text>
						<Text zIndex={1}>
							Developed by Daniel Yo, Chance Koogler, and Noah Jackson
						</Text>
					</VStack>
				</HStack>
			</Center>
			<div className="wave">
				<svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
					<path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="shape-fill"></path>
				</svg>
			</div>
		</div>
	)
}